import { createError, defineEventHandler, getQuery, setHeader } from 'h3'
import { promises as fs } from 'node:fs'
import { extname, join, normalize } from 'node:path'

type OutputFormat = 'webp' | 'avif' | 'jpeg' | 'png'

const CONTENT_TYPES: Record<OutputFormat, string> = {
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

const ALLOWED_FORMATS = new Set<OutputFormat>(['webp', 'avif', 'jpeg', 'png'])
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'])

function detectContentType(src: string): string {
  const ext = extname((src.split('?')[0] || '').toLowerCase())
  switch (ext) {
    case '.avif':
      return 'image/avif'
    case '.webp':
      return 'image/webp'
    case '.png':
      return 'image/png'
    case '.gif':
      return 'image/gif'
    case '.svg':
      return 'image/svg+xml'
    case '.jpg':
    case '.jpeg':
    default:
      return 'image/jpeg'
  }
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(max, Math.max(min, Math.round(parsed)))
}

function normalizeFormat(value: unknown): OutputFormat {
  const format = String(value || 'webp').toLowerCase() as OutputFormat
  return ALLOWED_FORMATS.has(format) ? format : 'webp'
}

function getOrigin(event: any): string {
  const headers = event.node.req.headers
  const protoHeader = String(headers['x-forwarded-proto'] || '')
  const proto = protoHeader.split(',')[0]?.trim() || 'https'
  const host = String(headers['x-forwarded-host'] || headers.host || '')
  return host ? `${proto}://${host}` : ''
}

async function readLocalImage(src: string): Promise<Buffer | null> {
  if (!src.startsWith('/')) return null

  const cleanPath = normalize(src.split('?')[0] || src)
  if (cleanPath.includes('..')) return null

  const candidates = [
    join(process.cwd(), 'public', cleanPath),
    join(process.cwd(), '.output', 'public', cleanPath),
    join(process.cwd(), 'server', 'public', cleanPath),
  ]

  for (const candidate of candidates) {
    try {
      const ext = extname(candidate).toLowerCase()
      if (ext && !IMAGE_EXTENSIONS.has(ext)) continue
      return await fs.readFile(candidate)
    } catch {
      // ignore and try next location
    }
  }

  return null
}

async function fetchImageBuffer(event: any, src: string): Promise<Buffer> {
  const local = await readLocalImage(src)
  if (local) return local

  const origin = getOrigin(event)
  const target = src.startsWith('http://') || src.startsWith('https://')
    ? src.replace(/^http:\/\//i, 'https://')
    : origin
      ? `${origin}${src.startsWith('/') ? src : `/${src}`}`
      : src

  const response = await fetch(target)
  if (!response.ok) {
    throw createError({
      statusCode: response.status || 404,
      statusMessage: 'Image source not found',
    })
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const src = String(query.src || '').trim()

  if (!src) {
    throw createError({ statusCode: 400, statusMessage: 'Image src is required' })
  }

  const width = clampNumber(query.w, 640, 16, 2400)
  const height = clampNumber(query.h, 640, 16, 2400)
  const quality = clampNumber(query.q, 78, 30, 95)
  const format = normalizeFormat(query.format)

  const sourceBuffer = await fetchImageBuffer(event, src)
  const sharpModule = await import('sharp').catch(() => null)
  const sharp = sharpModule?.default

  if (!sharp) {
    setHeader(event, 'Content-Type', detectContentType(src))
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    return sourceBuffer
  }

  try {
    let transformer = sharp(sourceBuffer, { failOn: 'none', animated: true }).rotate()

    transformer = transformer.resize({
      width,
      height,
      fit: 'inside',
      withoutEnlargement: true,
    })

    const outputBuffer = await (async () => {
      switch (format) {
        case 'avif':
          return transformer.avif({ quality }).toBuffer()
        case 'jpeg':
          return transformer.jpeg({ quality, mozjpeg: true }).toBuffer()
        case 'png':
          return transformer.png({ quality }).toBuffer()
        case 'webp':
        default:
          return transformer.webp({ quality }).toBuffer()
      }
    })()

    setHeader(event, 'Content-Type', CONTENT_TYPES[format])
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
    setHeader(event, 'Vary', 'Accept')

    return outputBuffer
  } catch {
    // Если sharp не смог обработать конкретный исходник, не роняем картинку.
    // Возвращаем оригинальный файл, чтобы карточка товара не оставалась пустой.
    setHeader(event, 'Content-Type', detectContentType(src))
    setHeader(event, 'Cache-Control', 'public, max-age=3600')
    return sourceBuffer
  }
})
