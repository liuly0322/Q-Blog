let mduiElement: HTMLElement | null = null
function getMduiElement() {
  mduiElement ??= document.querySelector('.mdui-overlay')
  return mduiElement
}

let sidebarElement: HTMLElement | null = null
function getSidebarElement() {
  sidebarElement ??= document.querySelector('#sidebar')
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
