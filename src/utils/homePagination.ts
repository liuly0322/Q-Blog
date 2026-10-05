export const HOME_PAGE_SIZE = 10

export function homePageCount(postCount: number) {
  return Math.max(1, Math.ceil(postCount / HOME_PAGE_SIZE))
}

export function homePagePath(page: number) {
  return page === 1 ? '/' : `/${page}`
}
