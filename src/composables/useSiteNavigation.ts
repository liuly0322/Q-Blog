const navOptions = [
  {
    label: '主页',
    to: '/',
    match: '/$',
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

export default () => ({ navOptions })
