// https://github.com/boyum/markdown-it-image-size/blob/main/src/index.ts
// Author: boyum
// License: Apache-2.0 license

import imageSize from 'image-size'
import type markdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'

export default function markdownItImageSize(md: markdownIt): void {
  md.renderer.rules.image = (tokens, index) => {
    const token = tokens[index]
    const srcIndex = token.attrIndex('src')
    const imageUrl = token.attrs![srcIndex][1]
    const caption = md.utils.escapeHtml(token.content)

    const otherAttributes = generateAttributes(md, token)

    const isExternalImage = imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
    const isLocalAbsoluteUrl = imageUrl.startsWith('/')

    const { width, height } = isExternalImage
      ? { width: undefined, height: undefined }
      : imageSize(`${isLocalAbsoluteUrl ? './public' : ''}${imageUrl}`)
    const dimensionsAttributes = width && height ? ` width="${width}" height="${height}"` : ''

    return `<img src="${imageUrl}" alt="${caption}"${dimensionsAttributes}${otherAttributes ? ` ${otherAttributes}` : ''}>`
  }
}

function generateAttributes(md: markdownIt, token: Token): string {
  const ignore = ['src', 'alt']
  const escape = ['title']

  return token.attrs!
    .filter(([key]) => !ignore.includes(key))
    .map(([key, value]) => {
      const escapeAttributeValue = escape.includes(key)
      const finalValue = escapeAttributeValue
        ? md.utils.escapeHtml(value)
        : value

      return `${key}="${finalValue}"`
    })
    .join(' ')
}
