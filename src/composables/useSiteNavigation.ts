const mobileNavigation = {
  '🏠主页': '/',
  '🗃️归档': '/archive',
  '🏷️标签': '/tags',
  '🔗友链': '/links',
  '🧡动画': '/bangumi',
  '❓关于': '/about',
}

const navOptions = [
  {
    label: '主页',
    to: '/',
    match: '/$',
  },
  {
    label: '归档',
    to: '/archive',
    match: '/archive$',
  },
  {
    label: '标签',
    to: '/tags',
    match: '/tags',
  },
  {
    label: '友链',
    to: '/links',
    match: '/links$',
  },
  {
    label: '动画',
    to: '/bangumi',
    match: '/bangumi$',
  },
  {
    label: '关于',
    to: '/about',
    match: '/about$',
  },
]

export default () => ({ mobileNavigation, navOptions })
