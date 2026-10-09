// ref: https://github.com/boyum/markdown-it-image-size/blob/main/src/index.ts
// Author: boyum
// License: Apache-2.0 license

import type markdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import path from 'node:path'
import imageSize from 'image-size'

export default (absolutePathPrefix = '') =>
  function markdownItImageSize(md: markdownIt): void {
    md.renderer.rules.image = (tokens, index) => {
      const token = tokens[index]
      const srcIndex = token.attrIndex('src')
      const mdUrl = token.attrs![srcIndex][1]
      const altText = md.utils.escapeHtml(token.content)
      const otherAttributes = generateAttributes(md, token)

      const { localPath, siteUrl } = getImageUrl(mdUrl, absolutePathPrefix)
      const { width, height } = localPath
        ? imageSize(localPath)
        : { width: null, height: null }
      const dimensionsAttributes = width && height ? ` width="${width}" height="${height}"` : ''

      return `<img src="${siteUrl}" alt="${altText}"${dimensionsAttributes}${otherAttributes ? ` ${otherAttributes}` : ''}>`
    }
  }

function getImageUrl(mdUrl: string, absolutePathPrefix: string): {
  localPath: string
  siteUrl: string
} {
  const isExternalImage = mdUrl.startsWith('http://') || mdUrl.startsWith('https://')
  if (isExternalImage) {
    return {
      localPath: '',
      siteUrl: mdUrl,
    }
  }

  const isLocalRelativeUrl = !mdUrl.startsWith('/')
  if (isLocalRelativeUrl)
    mdUrl = `/images/${path.basename(mdUrl)}`
  return {
    localPath: `./public${mdUrl}`,
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
