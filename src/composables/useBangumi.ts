interface Anime {
  updated_at: string
  comment: string
  tags: { name: string, count: number }[]
  subject: {
    date: string
    images: {
      small: string
      grid: string
      large: string
      medium: string
      common: string
    }
    name: string
    name_cn: string
    short_summary: string
    tags: { name: string, count: number }[]
    score: number
    type: number
    id: number
    eps: number
    volumes: number
    collection_total: number
    rank: number
  }
  subject_id: number
  vol_status: number
  ep_status: number
  subject_type: number
  type: number
  rate: number
  private: boolean
}

interface Collections {
  total: number
  limit: number
  offset: number
  data: Anime[]
}

const animeList: Ref<Anime[]> = ref([])
const PAGE_SIZE = 12
const loading = ref(true)
let ticking = false
const fetchAnimeList = ((page = 0) => async () => {
  if (ticking || !loading.value)
    return
  ticking = true
  const offset = page * PAGE_SIZE
  try {
    const res = await fetch(
        `https://api.bgm.tv/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${PAGE_SIZE}&offset=${offset}`,
    )
    if (!res.ok)
      throw new Error('Network response was not ok')

    const data: Collections = await res.json()
    const totalSize = data.total
    animeList.value = animeList.value.concat(data.data)
    if (offset + data.data.length >= totalSize)
      loading.value = false

    page++
  }
  catch (error) {
    loading.value = false
  }
  ticking = false
})()

function timeToDate(time: string) {
  const date = new Date(time)
  return `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
}

export default () => ({ animeList, loading, fetchAnimeList, timeToDate })
