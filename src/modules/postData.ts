export const postCache = new Map<string, string>()

if (import.meta.hot)
  import.meta.hot.on('vite:beforeUpdate', () => postCache.clear())

export async function getCachedPostData(postName: string) {
  const cached = postCache.get(postName)
  if (cached !== undefined)
    return cached

  const response = await fetch(`/posts/${postName}.htm`)
  if (!response.ok)
    // eslint-disable-next-line unicorn/error-message -- The caller supplies the user-facing error.
    throw new Error()

  const data = await response.text()
  postCache.set(postName, data)
  return data
}
