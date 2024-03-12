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

async function getCachedPostData(post: string, onCancel?: AsyncComputedOnCancel) {
  const postName = getPostName(post)
  const cached = sessionStorage.getItem(postName)
  if (cached)
    return cached

  const data = await getPostData(postName, onCancel)

  sessionStorage.setItem(postName, data)
  return data
}

const { summary } = useSummary()
function getCurrentPostSummary(post: string) {
  return summary.value.find(post_ => post.includes(post_.url)) ?? {
    url: '',
    title: '',
    tags: [],
    date: '',
  }
}

export default () => ({ getCachedPostData, getCurrentPostSummary })
