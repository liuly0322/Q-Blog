import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'

const tempDir = os.tmpdir()

export default function saveFiles(id: string, original: string, transformed: string) {
  const filename = id.split('/').pop()!
  const hash = Math.random().toString(36).slice(2, 8)
  const originalPath = path.join(tempDir, `${filename}-${hash}-original.js`)
  const transformedPath = path.join(tempDir, `${filename}-${hash}-transformed.js`)
  fs.writeFileSync(originalPath, original)
  fs.writeFileSync(transformedPath, transformed)
  return `Original: ${originalPath}\nTransformed: ${transformedPath}`
}
