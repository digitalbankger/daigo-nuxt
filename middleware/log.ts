export default defineEventHandler((event) => {
  console.log('[SSR] Request:', event.node.req.url)
})
