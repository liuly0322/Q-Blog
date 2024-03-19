import * as parser from '@babel/parser'
import _generator from '@babel/generator'
import logger from './log'
import saveFiles from './utils'
import type { Config } from './config'
import { vueComponentMJSEvaluate } from './vueComponent'
import { shouldBeTransformed } from './config'

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
    enforce: 'pre',
    async transform(code: string, id: string) {
      if (!shouldBeTransformed(id, userConfig))
        return null
      const ast = parser.parse(code, { sourceType: 'module' })

      vueComponentMJSEvaluate(ast, id, userConfig)

      const { code: transformedCode } = generator(ast, { retainLines: true })
      const log = await saveFiles(id, code, transformedCode)
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
