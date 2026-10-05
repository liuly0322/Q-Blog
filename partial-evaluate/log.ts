/* eslint-disable no-console */
export default (() => {
  const logs: string[] = []
  return {
    log: (message: string) => logs.push(message),
    getLogs: () => logs,
    print: () => {
      console.log(logs.join('\n'))
    },
    clear: () => logs.length = 0,
  }
})()
