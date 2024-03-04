function getCurrentYear() {
  return new Date().getFullYear()
}

function getCurrentSeason() {
  const month = new Date().getMonth()
  if (month >= 2 && month <= 4)
    return '春'
  if (month >= 5 && month <= 7)
    return '夏'
  if (month >= 8 && month <= 10)
    return '秋'
  return '冬'
}

export default () => ({ getCurrentYear, getCurrentSeason })
