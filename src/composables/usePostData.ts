import type { AsyncComputedOnCancel } from '@vueuse/core'

function getPostName(post: string) {
  return (parts => parts.pop() || parts.pop() || '')(post.split('/')).split('.')[0]
}

async function getPostData(post: string, onCancel?: AsyncComputedOnCancel) {
  const postName = getPostName(post)
  const abortController = new AbortController()
  onCancel && onCancel(() => abortController.abort())
  return fetch(`/posts/${postName}.htm`, { signal: abortController.signal })
    .then(res => res.text())
}

const { summary } = useSummary()
function getCurrentPostSummary(post: string) {
  return summary.find(post_ => post.includes(post_.url)) ?? {
    url: '',
    title: '',
    tags: [],
    date: '',
  }
}

export default () => ({ getPostData, getCurrentPostSummary })
