#!/usr/bin/env node
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { createWriteStream } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { pipeline } from 'node:stream/promises'

let sharp
try {
  sharp = (await import('sharp')).default
} catch (error) {
  console.error('Не найден пакет "sharp". Установи его перед запуском: pnpm add -D sharp')
  process.exit(1)
}

const PROJECT_ROOT = process.cwd()
const PUBLIC_DIR = path.join(PROJECT_ROOT, 'public')
const OUTPUT_DIR = path.join(PUBLIC_DIR, 'images', 'optimized')
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json')
const API_BASE = process.env.IMAGE_SOURCE_API_BASE || 'http://localhost:3000/api'
const SITE_BASE = process.env.IMAGE_SITE_BASE || 'http://localhost:3000'
const WIDTHS = [120, 200, 320, 480, 800, 1200, 1600, 2000]

function stripQueryAndHash(value) {
  return String(value || '').split('#')[0].split('?')[0]
}

function safeSegment(value) {
  return encodeURIComponent(String(value || '').trim())
}

function normalizeSource(src) {
  return String(src || '').trim().replace(/^http:\/\//i, 'https://')
}

function splitBaseName(fileName) {
  const match = String(fileName || 'image').match(/^(.*?)(\.[^.]+)?$/)
  return {
    name: match?.[1] || 'image',
    ext: match?.[2] || '',
  }
}

function getBaseRelativePath(src) {
  const normalized = normalizeSource(src)
  if (!normalized) return null

  if (/^https?:\/\//i.test(normalized)) {
    const url = new URL(normalized)
    const pathname = stripQueryAndHash(url.pathname).replace(/^\/+/, '')
    const parts = ['remote', url.host, ...pathname.split('/').filter(Boolean)]
    const fileName = parts.pop() || 'image'
    const { name } = splitBaseName(fileName)
    return path.join(...parts.map(safeSegment), safeSegment(name))
  }

  if (normalized.startsWith('/')) {
    const pathname = stripQueryAndHash(normalized).replace(/^\/+/, '')
    const parts = ['local', ...pathname.split('/').filter(Boolean)]
    const fileName = parts.pop() || 'image'
    const { name } = splitBaseName(fileName)
    return path.join(...parts.map(safeSegment), safeSegment(name))
  }

  return null
}

async function exists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch {
    return false
  }
}

async function readLocalPublicFile(src) {
  const clean = stripQueryAndHash(src).replace(/^\/+/, '')
  const filePath = path.join(PUBLIC_DIR, clean)
  if (!(await exists(filePath))) return null
  return readFile(filePath)
}

async function fetchBuffer(url) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

async function loadImageBuffer(src) {
  const normalized = normalizeSource(src)
  if (!normalized) throw new Error('Empty src')

  if (normalized.startsWith('/')) {
    const localBuffer = await readLocalPublicFile(normalized)
    if (localBuffer) return localBuffer
    return fetchBuffer(new URL(normalized, SITE_BASE).toString())
  }

  return fetchBuffer(normalized)
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  return res.json()
}

function collectImageUrls(productList, productCards) {
  const urls = new Set()

  for (const item of productList) {
    if (item?.image) urls.add(item.image)
    if (Array.isArray(item?.detailImages)) {
      for (const image of item.detailImages) {
        if (image) urls.add(image)
      }
    }
  }

  for (const product of productCards) {
    if (Array.isArray(product?.images)) {
      for (const image of product.images) {
        if (image?.image_url) urls.add(image.image_url)
      }
    }
  }

  return [...urls]
}

async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true })
}

async function writeVariant(baseRelativePath, width, format, buffer) {
  const outputPath = path.join(OUTPUT_DIR, baseRelativePath, `w-${width}.${format}`)
  await ensureDir(path.dirname(outputPath))
  await writeFile(outputPath, buffer)
  return outputPath
}

async function processImage(src, manifest) {
  const baseRelativePath = getBaseRelativePath(src)
  if (!baseRelativePath) return { src, skipped: true, reason: 'unsupported' }

  if (manifest[src]?.done) {
    return { src, skipped: true, reason: 'manifest' }
  }

  const input = await loadImageBuffer(src)
  const image = sharp(input, { failOn: 'none' }).rotate()
  const metadata = await image.metadata()
  const generated = []

  for (const width of WIDTHS) {
    const transformed = image.clone().resize({
      width,
      fit: 'inside',
      withoutEnlargement: true,
    })

    const avifBuffer = await transformed.clone().avif({ quality: 50, effort: 4 }).toBuffer()
    const webpBuffer = await transformed.clone().webp({ quality: 72, effort: 4 }).toBuffer()

    await writeVariant(baseRelativePath, width, 'avif', avifBuffer)
    await writeVariant(baseRelativePath, width, 'webp', webpBuffer)

    generated.push({ width, formats: ['avif', 'webp'] })
  }

  manifest[src] = {
    done: true,
    width: metadata.width || null,
    height: metadata.height || null,
    generatedAt: new Date().toISOString(),
    baseRelativePath: baseRelativePath.split(path.sep).join('/'),
    widths: WIDTHS,
  }

  return { src, skipped: false, generated }
}

async function loadManifest() {
  try {
    const raw = await readFile(MANIFEST_PATH, 'utf8')
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

async function saveManifest(manifest) {
  await ensureDir(path.dirname(MANIFEST_PATH))
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8')
}

async function main() {
  console.log(`API_BASE=${API_BASE}`)
  console.log(`SITE_BASE=${SITE_BASE}`)

  const catalog = await fetchJson(`${API_BASE}/shop/products?page=1&page_size=9999`)
  const items = Array.isArray(catalog?.items) ? catalog.items : []
  const slugs = items.map((item) => item?.slug).filter(Boolean)

  const cards = []
  for (const slug of slugs) {
    try {
      const product = await fetchJson(`${API_BASE}/shop/${encodeURIComponent(slug)}`)
      cards.push(product)
    } catch (error) {
      console.warn(`[skip product] ${slug}: ${error.message}`)
    }
  }

  const manifest = await loadManifest()
  const images = collectImageUrls(items, cards)
  console.log(`Найдено изображений: ${images.length}`)

  let ok = 0
  let skipped = 0
  let failed = 0

  for (const src of images) {
    try {
      const result = await processImage(src, manifest)
      if (result.skipped) {
        skipped += 1
        console.log(`[skip] ${src} (${result.reason})`)
      } else {
        ok += 1
        console.log(`[ok] ${src}`)
      }
    } catch (error) {
      failed += 1
      console.error(`[fail] ${src}: ${error.message}`)
    }
  }

  await saveManifest(manifest)

  console.log('Готово:')
  console.log(`  ok: ${ok}`)
  console.log(`  skipped: ${skipped}`)
  console.log(`  failed: ${failed}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
