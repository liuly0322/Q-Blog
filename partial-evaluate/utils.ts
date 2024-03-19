export default async function saveFiles(id: string, original: string, transformed: string) {
  const fs = await import('node:fs')
  const filename = id.split('/').pop()!
  const hash = Math.random().toString(36).slice(2, 8)
  fs.writeFileSync(`/tmp/before-${filename}-${hash}`, original)
  fs.writeFileSync(`/tmp/after-${filename}-${hash}`, transformed)
  return `Saved files to /tmp/before-${filename}-${hash} and /tmp/after-${filename}-${hash}`
}
