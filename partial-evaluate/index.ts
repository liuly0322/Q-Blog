import type { Config } from './config'
import _generator from '@babel/generator'
import * as parser from '@babel/parser'
import { getTransformers } from './config'
import logger from './log'
import saveFiles from './utils'

// @ts-expect-error: https://github.com/babel/babel/issues/15269
const generator = _generator.default as typeof _generator

export default (config?: Config) => {
  const userConfig: Config = config || {
    components: {},
  }
  if (userConfig.silent === true)
    logger.print = () => {}

  return {
    name: 'partial-evaluate-optimizer-plugin',
    async transform(code: string, id: string) {
      const transformers = getTransformers(id, userConfig)
      if (transformers.length === 0)
        return null
      const ast = parser.parse(code, { sourceType: 'module' })

      for (const transformer of transformers)
        transformer(ast, id, userConfig)

      const { code: transformedCode } = generator(ast, { retainLines: true })
      const log = saveFiles(id, code, transformedCode)
      logger.log(`${log}\n`)
      return code === transformedCode
        ? null
        : {
            code: transformedCode,
            map: null,
          }
    },
    closeBundle() {
      logger.print()
      logger.clear()
    },
  }
}
