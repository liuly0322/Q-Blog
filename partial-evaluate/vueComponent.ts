import path from 'node:path'
import type { NodePath } from '@babel/traverse'
import _traverse from '@babel/traverse'
import type { CallExpression } from '@babel/types'
import { replaceDestructure, replaceMemberExpression } from './replacement'
import type { Config } from './config'
import logger from './log'

const traverse = ((_traverse as any as { default: any }).default) as typeof _traverse

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
        if (setupNode) {
          const PropsWithKnownValue = userConfig.components[componentName]
          replaceMemberExpression(setupNode, 'props', PropsWithKnownValue)
          replaceDestructure(setupNode, 'props', PropsWithKnownValue)
        }

        if (renderNode) {
          const PropsWithKnownValue = userConfig.components[componentName]
          replaceMemberExpression(renderNode, 'this', PropsWithKnownValue)
          replaceDestructure(renderNode, 'this', PropsWithKnownValue)
        }
      }
    },
  }
}

export function vueComponentMJSEvaluate(ast: any, id: string, userConfig: Config) {
  const componentName = path.basename(id).replace(/\.mjs$/, '')
  traverse(ast, vueComponentMJSTraverseHandler(componentName, userConfig))
}