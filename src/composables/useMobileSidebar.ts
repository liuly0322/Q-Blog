function getMduiElement() {
  return document.querySelector('.mdui-overlay')
}

function getSidebarElement() {
  return document.querySelector('#sidebar')
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
