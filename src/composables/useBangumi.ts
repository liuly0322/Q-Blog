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

function prettyAnimeDates(animes: Anime[]) {
  return animes.map((anime) => {
    const date = new Date(anime.updated_at)
    const update_time = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getDate()}`
    return {
      ...anime,
      updated_at: update_time,
    }
  })
}

const PAGE_SIZE = 12
const animeList: Ref<Anime[]> = ref([])
async function updateBangumiData(page: number) {
  const offset = page * PAGE_SIZE
  const res = await fetch(
    `https://api.bgm.tv/v0/users/undef_baka/collections?subject_type=2&type=2&limit=${PAGE_SIZE}&offset=${offset}`,
  )
  if (!res.ok)
    throw new Error('Network response was not ok')

  const data: Collections = await res.json()
  const totalSize = data.total
  animeList.value = animeList.value.concat(prettyAnimeDates(data.data))
  if (offset + data.data.length >= totalSize)
    throw new Error('No more data')
}

let page = 0
const loading = ref(true)
async function updateNewPage() {
  try {
    await updateBangumiData(page)
    page++
  }
  catch (error) {
    loading.value = false
  }
}

let ticking = false
async function updateAnimeList() {
  if (ticking || !loading.value)
    return
  ticking = true
  await updateNewPage()
  ticking = false
}

export default () => {
  updateAnimeList()
  return { animeList, loading, updateAnimeList }
}
