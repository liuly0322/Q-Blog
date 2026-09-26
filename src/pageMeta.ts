export const SITE_TITLE = 'llyのblog'

export const staticPageTitles: Record<string, string> = {
  '/': SITE_TITLE,
  '/about': `关于 | ${SITE_TITLE}`,
  '/archive': `归档 | ${SITE_TITLE}`,
  '/links': `友情链接 | ${SITE_TITLE}`,
  '/tags': `标签 | ${SITE_TITLE}`,
  '/bangumi': `动画列表 | ${SITE_TITLE}`,
}

export const staticPageDetails: Record<string, { file: string, description: string }> = {
  '/': { file: 'index.html', description: '我的个人博客，写点想写的' },
  '/about': { file: 'about.html', description: 'lly 的经历、兴趣与联系方式。' },
  '/archive': { file: 'archive.html', description: 'llyのblog 的全部文章。' },
  '/links': { file: 'links.html', description: 'llyのblog 的友情链接。' },
  '/tags': { file: 'tags.html', description: 'llyのblog 的文章标签。' },
  '/bangumi': { file: 'bangumi.html', description: '我在 Bangumi 上看过的动画及短评。' },
}
