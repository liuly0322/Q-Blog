import path from 'node:path'

export interface Config {
  components: {
    [componentName: string]: Record<string, unknown>
  }
}

export function shouldBeTransformed(id: string, userConfig: Config): boolean {
  if (!id.endsWith('.mjs'))
    return false
  const componentName = path.basename(id).replace(/\.mjs$/, '')
  return !!userConfig.components[componentName]
}
