export const homePostsCache = new Map<number, string[]>()

if (import.meta.hot)
  import.meta.hot.on('vite:beforeUpdate', () => homePostsCache.clear())

async function getAbstracts(page: number): Promise<string[]> {
  const response = await fetch(`/homePages/home-page-${page}.json`)
  return response.json()
}

export async function loadHomePage(page: number) {
  if (!homePostsCache.has(page))
    homePostsCache.set(page, await getAbstracts(page))
}
