import { defineEventHandler, readBody, createError, getRequestIP } from 'h3'

export default defineEventHandler(async (event) => {
  const { name, phone, email, comment, source } = await readBody(event)

  if (!name || !phone) {
    throw createError({ statusCode: 400, statusMessage: 'name and phone are required' })
  }

  // простейший rate-limit по IP (в памяти)
  const ip = getRequestIP(event) || '0.0.0.0'
  // @ts-ignore
  globalThis.__leadRate ||= new Map<string, number>()
  // @ts-ignore
  const last = globalThis.__leadRate.get(ip) || 0
  if (Date.now() - last < 15_000) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
  // @ts-ignore
  globalThis.__leadRate.set(ip, Date.now())

  const base = process.env.B24_WEBHOOK_BASE // например: https://your.bitrix24.ru/rest/ID/TOKEN/
  if (!base) throw createError({ statusCode: 500, statusMessage: 'Webhook not configured' })

  const url = `${base.replace(/\/+$/, '')}/crm.lead.add.json`

  // Собираем поля лида Bitrix
  const FIELDS:any = {
    TITLE: `Промо-подарок — ${name}`,
    NAME: name,
    PHONE: [{ VALUE: phone, VALUE_TYPE: 'WORK' }],
    EMAIL: email ? [{ VALUE: email, VALUE_TYPE: 'WORK' }] : undefined,
    COMMENTS: comment || '',
    SOURCE_ID: 'WEB',
    UF_CRM_PROMO_SOURCE: source || 'PromoHero' // если есть доп. поле — замените на ваше
  }

  // Удаляем undefined
  Object.keys(FIELDS).forEach(k => FIELDS[k] === undefined && delete FIELDS[k])

  const payload = { fields: FIELDS, params: { REGISTER_SONET_EVENT: 'Y' } }

  const res = await $fetch<any>(url, { method: 'POST', body: payload })

  if (res?.error) {
    throw createError({ statusCode: 502, statusMessage: `Bitrix error: ${res.error_description || res.error}` })
  }

  return { id: res?.result }
})
