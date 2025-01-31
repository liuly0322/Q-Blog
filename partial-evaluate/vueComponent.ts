import path from 'node:path'
import type { NodePath } from '@babel/traverse'
import _traverse from '@babel/traverse'
import type { CallExpression, File } from '@babel/types'
import type { ParseResult } from '@babel/parser'
import { replaceDestructure, replaceMemberExpression } from './replacement'
import type { Config } from './config'
import logger from './log'

// @ts-expect-error: https://github.com/babel/babel/issues/15269
const traverse = _traverse.default as typeof _traverse

export function vueComponentMJSTraverseHandler(componentName: string, userConfig: Config) {
  return {
    CallExpression(path: NodePath<CallExpression>) {
      if (
        path.get('callee').isIdentifier({ name: 'defineComponent' })
        && path.parentPath.isExportDefaultDeclaration()
      ) {
        let setupNode: NodePath | null = null
        let renderNode: NodePath | null = null
        path.traverse({
          ObjectMethod(nodePath) {
            const key = nodePath.node.key
            if (key.type !== 'Identifier')
              return
            const name = key.name
            if (name === 'setup')
              setupNode = nodePath
            if (name === 'render')
              renderNode = nodePath
            if (setupNode && renderNode)
              return false
          },
        })

        logger.log(`Optimizing props for ${componentName}:`)
        const PropsWithKnownValue = userConfig.components[componentName]
        if (setupNode) {
          replaceMemberExpression(setupNode, 'props', PropsWithKnownValue)
          replaceDestructure(setupNode, 'props', PropsWithKnownValue)
        }

        if (renderNode) {
          replaceMemberExpression(renderNode, 'this', PropsWithKnownValue)
          replaceDestructure(renderNode, 'this', PropsWithKnownValue)
        }
      }
    },
  }
}

export function vueComponentMJSEvaluate(ast: ParseResult<File>, id: string, userConfig: Config) {
  const componentName = path.basename(id).replace(/\.mjs$/, '')
  traverse(ast, vueComponentMJSTraverseHandler(componentName, userConfig))
}
