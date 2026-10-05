type OnCancel = (callback: () => void) => void

export const postCache = new Map<string, string>()

if (import.meta.hot)
  import.meta.hot.on('vite:beforeUpdate', () => postCache.clear())

async function getPostData(postName: string, onCancel?: OnCancel) {
  const abortController = new AbortController()
  onCancel && onCancel(() => abortController.abort())
  return fetch(`/posts/${postName}.htm`, { signal: abortController.signal })
    .then((res) => {
      if (!res.ok)
        throw new Error(`Post request failed: ${res.status}`)
      return res.text()
    })
}

export async function getCachedPostData(postName: string, onCancel?: OnCancel) {
  const cached = postCache.get(postName)
  if (cached !== undefined)
    return cached

  const data = await getPostData(postName, onCancel)

  postCache.set(postName, data)
  return data
}
