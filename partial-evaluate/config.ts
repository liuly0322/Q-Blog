import path from 'node:path'
import { vueComponentMJSEvaluate } from './vueComponent'

export interface Config {
  silent?: boolean
  components: {
    [componentName: string]: Record<string, unknown>
  }
}

export function getTransformers(id: string, userConfig: Config) {
  const transformers = []
  if (id.endsWith('.mjs')) {
    const componentName = path.basename(id).replace(/\.mjs$/, '')
    if (userConfig.components[componentName])
      transformers.push(vueComponentMJSEvaluate)
  }
  return transformers
}
