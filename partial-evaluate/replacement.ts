import type { NodePath } from '@babel/traverse'
import type { MemberExpression } from '@babel/types'
import babel from '@babel/core'
import logger from './log'

// replace `props.prop` with given const
export function replaceMemberExpression(node: NodePath, props: Record<string, any>) {
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

// replace `const { prop } = props` with given const
export function replaceDestructure(node: NodePath, props: Record<string, any>) {
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
