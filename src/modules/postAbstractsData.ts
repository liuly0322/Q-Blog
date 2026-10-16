export const postAbstractsCache = new Map<number, string[]>()

if (import.meta.hot)
  import.meta.hot.on('vite:beforeUpdate', () => postAbstractsCache.clear())

async function getPostAbstracts(page: number): Promise<string[]> {
  return fetch(`/homePages/home-page-${page}.json`).then(res => res.json()).catch(() => [])
}

export async function loadPostAbstracts(page: number) {
  postAbstractsCache.has(page) || postAbstractsCache.set(page, await getPostAbstracts(page))
}
