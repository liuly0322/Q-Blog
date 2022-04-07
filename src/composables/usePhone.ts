const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)

/**
 * 用于手机端切换导航栏
 * @param open   用于显式指定是打开还是关闭
 */
const phoneNavToggle = (open?: boolean) => {
  const openNav = () => {
    document.querySelector('.mdui-overlay')?.classList.add('mdui-overlay-show')
    document.documentElement.classList.add('nav-overflow-hidden')
  }
  const closeNav = () => {
    document
      .querySelector('.mdui-overlay')
      ?.classList.remove('mdui-overlay-show')
    document.documentElement.classList.remove('nav-overflow-hidden')
  }
  const toggle = () =>
    (document.querySelector('.n-layout-toggle-button') as HTMLElement).click()

  const currNavOpen = document.querySelector('.n-layout-sider--collapsed')
    ? false
    : true
  if (typeof open !== 'undefined') {
    open ? openNav() : closeNav()
    if (open !== currNavOpen) {
      toggle()
    }
  } else {
    currNavOpen ? closeNav() : openNav()
    toggle()
  }
}

export default () => ({ isMobile, phoneNavToggle })
