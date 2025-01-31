import type { AsyncComputedOnCancel } from '@vueuse/core'

function getPostName(post: string) {
  return (parts => parts.pop() || parts.pop() || '')(post.split('/')).split('.')[0]
}

async function getPostData(postName: string, onCancel?: AsyncComputedOnCancel) {
  const abortController = new AbortController()
  onCancel && onCancel(() => abortController.abort())
  return fetch(`/posts/${postName}.htm`, { signal: abortController.signal })
    .then(res => res.text())
}

function getCachedSeconds(postName: string) {
  const now = Date.now()
  const cachedTime = sessionStorage.getItem(`${postName}__time`) ?? '0'
  return (now - Number(cachedTime)) / 1000
}

async function getCachedPostData(post: string, onCancel?: AsyncComputedOnCancel) {
  const postName = getPostName(post)
  const cached = sessionStorage.getItem(postName)
  const cachedSeconds = getCachedSeconds(postName)
  if (cached && cachedSeconds < 3600)
    return cached

  const data = await getPostData(postName, onCancel)

  sessionStorage.setItem(postName, data)
  sessionStorage.setItem(`${postName}__time`, Date.now().toString())
  return data
}

const emptySummary = Object.freeze({ url: '', title: '404 Not Found', tags: [], date: '' })

const { summary } = useSummary()
function getCurrentPostSummary(post: string) {
  return summary.find(post_ => post.includes(post_.url)) ?? emptySummary
}

export default () => ({ emptySummary, getCachedPostData, getCurrentPostSummary })
