import { defineEventHandler, getQuery, setResponseHeader } from 'h3'
import {
  getCatalogCountsFromSnapshot,
  getCatalogSnapshot,
} from '~/server/utils/catalogSnapshot'

export default defineEventHandler(async (event) => {
  const query = getQuery(event) as Record<string, unknown>
  const { snapshot, source } = await getCatalogSnapshot(event, { allowStale: true })
  const counts = getCatalogCountsFromSnapshot(snapshot, query)

  setResponseHeader(event, 'Cache-Control', 'private, max-age=0, must-revalidate')
  setResponseHeader(event, 'X-Catalog-Snapshot', source)
  setResponseHeader(event, 'X-Catalog-Snapshot-Generated-At', snapshot.generatedAt)

  return {
    counts,
    generatedAt: snapshot.generatedAt,
  }
})
