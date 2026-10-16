interface Anime {
  comment: string
  subject: {
    images: {
      medium: string
    }
    name: string
    name_cn: string
    short_summary: string
    id: number
  }
  rate: number
}

interface Collections {
  total: number
  data: Anime[]
}

const PAGE_SIZE = 12

export const animeList: Ref<Anime[]> = ref([])
export const hasMore = ref(true)

async function updateBangumiData(page: number) {
  const offset = page * PAGE_SIZE
  const res = await fetch(`https://bgm.liuly.moe/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${PAGE_SIZE}&offset=${offset}`)
  if (!res.ok)
    throw new Error('Network response was not ok')

  const data: Collections = await res.json()
  const totalSize = data.total
  animeList.value = animeList.value.concat(data.data)
  if (offset + data.data.length >= totalSize)
    throw new Error('No more data')
}

const updateNewPage = (() => {
  let page = 0
  return async () => {
    await updateBangumiData(page++).catch(() => hasMore.value = false)
  }
})()

export const updateAnimeList = (() => {
  let loading = false
  return async () => {
    if (loading || !hasMore.value)
      return
    loading = true
    await updateNewPage()
    loading = false
  }
})()
