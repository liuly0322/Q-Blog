// Cache DOM elements to avoid repeated queries
let mduiElement: Element | null = null
let sidebarElement: Element | null = null

function getMduiElement() {
  if (!mduiElement)
    mduiElement = document.querySelector('.mdui-overlay')
  return mduiElement
}

function getSidebarElement() {
  if (!sidebarElement)
    sidebarElement = document.querySelector('#sidebar')
  return sidebarElement
}

function openSidebar() {
  getMduiElement()?.classList.add('mdui-overlay-show')
  getSidebarElement()?.classList.add('sidebar-open')
}

function closeSidebar() {
  getMduiElement()?.classList.remove('mdui-overlay-show')
  getSidebarElement()?.classList.remove('sidebar-open')
}

function toggleSidebar() {
  const currNavOpen = getSidebarElement()?.classList.contains('sidebar-open')
  currNavOpen ? closeSidebar() : openSidebar()
}

export default () => ({ openSidebar, closeSidebar, toggleSidebar })
