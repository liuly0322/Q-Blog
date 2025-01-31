// ref: https://github.com/boyum/markdown-it-image-size/blob/main/src/index.ts
// Author: boyum
// License: Apache-2.0 license

import path from 'node:path'
import imageSize from 'image-size'
import type markdownIt from 'markdown-it'
import type { Token } from 'markdown-it'

export default (absolutePathPrefix = '') =>
  function markdownItImageSize(md: markdownIt): void {
    md.renderer.rules.image = (tokens, index) => {
      const token = tokens[index]
      const srcIndex = token.attrIndex('src')
      const mdUrl = token.attrs![srcIndex][1]
      const caption = md.utils.escapeHtml(token.content)
      const otherAttributes = generateAttributes(md, token)

      const { localUrl, siteUrl } = getImageUrl(mdUrl, absolutePathPrefix)
      const { width, height } = localUrl
        ? imageSize(localUrl)
        : { width: null, height: null }
      const dimensionsAttributes = width && height ? ` width="${width}" height="${height}"` : ''

      return `<img src="${siteUrl}" alt="${caption}"${dimensionsAttributes}${otherAttributes ? ` ${otherAttributes}` : ''}>`
    }
  }

function getImageUrl(mdUrl: string, absolutePathPrefix: string): {
  localUrl: string
  siteUrl: string
} {
  const isExternalImage = mdUrl.startsWith('http://') || mdUrl.startsWith('https://')
  if (isExternalImage) {
    return {
      localUrl: '',
      siteUrl: mdUrl,
    }
  }

  const isLocalRelativeUrl = !mdUrl.startsWith('/')
  if (isLocalRelativeUrl)
    mdUrl = `/images/${path.basename(mdUrl)}`
  return {
    localUrl: `./public${mdUrl}`,
    siteUrl: `${absolutePathPrefix}${mdUrl}`,
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
