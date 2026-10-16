export default function extractAbstract(content: string) {
  const moreIndex = content.indexOf('<!-- more -->')
  if (moreIndex !== -1)
    return content.slice(0, moreIndex)
  return content.slice(0, 100)
}
