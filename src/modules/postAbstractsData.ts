export const postAbstractsCache = new Map<number, string[]>()

if (import.meta.hot)
  import.meta.hot.on('vite:beforeUpdate', () => postAbstractsCache.clear())

async function getPostAbstracts(page: number): Promise<string[]> {
  const response = await fetch(`/homePages/home-page-${page}.json`)
  return response.json()
}

export async function loadPostAbstracts(page: number) {
  if (!postAbstractsCache.has(page))
    postAbstractsCache.set(page, await getPostAbstracts(page))
}
