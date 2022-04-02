import summary from '../../assets/summary.json'
export interface PostSummary {
  title: string
  date: string
  tags: string[]
  url: string
}

export default () => summary 