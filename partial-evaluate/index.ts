import * as path from 'node:path'
import * as parser from '@babel/parser'
import type { NodePath } from '@babel/traverse'
import _traverse from '@babel/traverse'
import _generator from '@babel/generator'
import type { MemberExpression } from '@babel/types'
import babel from '@babel/core'
import Logger from './log'

const traverse = ((_traverse as any as { default: any }).default) as typeof _traverse
const generator = ((_generator as any as { default: any }).default) as typeof _generator

const logger = Logger()

async function saveFiles(id: string, original: string, transformed: string) {
  const fs = await import('node:fs')
  const filename = id.split('/').pop()!
  const hash = Math.random().toString(36).slice(2, 8)
  fs.writeFileSync(`/tmp/before-${filename}-${hash}`, original)
  fs.writeFileSync(`/tmp/after-${filename}-${hash}`, transformed)
  logger.log(`Saved files to /tmp/before-${filename}-${hash} and /tmp/after-${filename}-${hash}`)
}

// props.prop
function replaceMemberExpression(node: NodePath, props: Record<string, any>) {
  const propsAssignmentNode: NodePath<MemberExpression>[] = []
  const potentialOptimizeProps: Set<string> = new Set()
  node.traverse({
    MemberExpression(nodePath) {
      if (nodePath.get('object').isIdentifier({ name: 'props' })) {
        propsAssignmentNode.push(nodePath)
        potentialOptimizeProps.add(nodePath.toString().split('.')[1])
      }
    },
  })
  logger.log(`Potential optimize member expression: ${Array.from(potentialOptimizeProps).join(', ')}`)
  propsAssignmentNode.forEach((nodePath) => {
    const propNode = nodePath.get('property').node
    if (propNode.type !== 'Identifier')
      return
    const propName = propNode.name
    if (propName in props)
      nodePath.replaceWithSourceString(props[propName])
  })
}

// const { prop } = props
function replaceDestructure(node: NodePath, props: Record<string, any>) {
  const potentialOptimizeProps: Set<string> = new Set()
  node.traverse({
    VariableDeclarator(nodePath) {
      if (!nodePath.get('init').isIdentifier({ name: 'props' }))
        return
      const id = nodePath.get('id')
      if (!id.isObjectPattern())
        return
      const properties = id.get('properties')
      if (properties.length !== 1)
        return
      const property = properties[0]
      if (!property.isObjectProperty())
        return
      const key = property.get('key')
      if (!key.isIdentifier())
        return
      const propName = key.node.name
      potentialOptimizeProps.add(propName)
      if (propName in props) {
        const newVariableDeclarator = babel.template.statement.ast(`${propName} = ${props[propName]};`)
        nodePath.replaceWith(newVariableDeclarator)
      }
    },
  })
  logger.log(`Potential optimize destructure: ${Array.from(potentialOptimizeProps).join(', ')}`)
}

interface Config {
  components: {
    [componentName: string]: Record<string, any>
  }
}

export default (config?: Config) => {
  const userConfig: Config = config || {
    components: {},
  }

  return {
    name: 'props-optimizer-plugin',
    enforce: 'pre',
    async transform(code: string, id: string) {
      if (!id.endsWith('.mjs'))
        return null

      const componentName = path.basename(id).replace(/\.mjs$/, '')

      if (!userConfig.components[componentName])
        return null

      const ast = parser.parse(code, { sourceType: 'module' })

      traverse(ast, {
        CallExpression(path) {
          if (
            path.get('callee').isIdentifier({ name: 'defineComponent' })
            && path.parentPath.isExportDefaultDeclaration()
          ) {
            let setupNode: NodePath | null = null
            path.traverse({
              ObjectMethod(nodePath) {
                const key = nodePath.node.key
                if (key.type !== 'Identifier')
                  return
                const name = key.name
                if (name === 'setup') {
                  setupNode = nodePath
                  return false // 停止遍历
                }
              },
            })

            if (setupNode) {
              logger.log(`Optimizing props for ${id.split('/').pop()}:`)
              const PropsWithKnownValue = userConfig.components[componentName]
              replaceMemberExpression(setupNode, PropsWithKnownValue)
              replaceDestructure(setupNode, PropsWithKnownValue)
            }
          }
        },
      })

      const { code: transformedCode } = generator(ast, { retainLines: true })

      if (code !== transformedCode) {
        await saveFiles(id, code, transformedCode)
        logger.log('')
        return {
          code: transformedCode,
          map: null,
        }
      }

      return null
    },
    closeBundle() {
      logger.print()
      logger.clear()
    },
  }
}
