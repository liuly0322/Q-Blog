import type { NodePath } from '@babel/traverse'
import type { MemberExpression, VariableDeclarator } from '@babel/types'
import babel from '@babel/core'
import logger from './log'

function isValidMemberExpression(node: NodePath<MemberExpression>, constObjectName: string) {
  if (constObjectName === 'this')
    return node.get('object').isThisExpression()
  return node.get('object').isIdentifier({ name: constObjectName })
}

function isValidDestructure(node: NodePath<VariableDeclarator>, constObjectName: string) {
  if (constObjectName === 'this')
    return node.get('init').isThisExpression()
  return node.get('init').isIdentifier({ name: constObjectName })
}

/**
 *  Replace `props.prop` with given const
 * @param node Root node of function body needs to be optimized
 * @param constObjectName Name of the object that contains the constants
 * @param consts Map of constants
 */
export function replaceMemberExpression(node: NodePath, constObjectName: string, consts: Record<string, any>) {
  const memberExpressions: NodePath<MemberExpression>[] = []
  const potentialOptimizeProps: Set<string> = new Set()
  node.traverse({
    MemberExpression(nodePath) {
      if (isValidMemberExpression(nodePath, constObjectName)) {
        memberExpressions.push(nodePath)
        potentialOptimizeProps.add(nodePath.toString().split('.')[1])
      }
    },
  })
  logger.log(`Potential optimize member expression: ${Array.from(potentialOptimizeProps).join(', ')}`)
  memberExpressions.forEach((nodePath) => {
    const propNode = nodePath.get('property').node
    if (propNode.type !== 'Identifier')
      return
    const propName = propNode.name
    if (propName in consts)
      nodePath.replaceWithSourceString(consts[propName])
  })
}

/**
 * replace `const { prop } = props` with given const
 * @param node Root node of function body needs to be optimized
 * @param constObjectName Name of the object that contains the constants
 * @param props Map of constants
 */
export function replaceDestructure(node: NodePath, constObjectName: string, props: Record<string, any>) {
  const potentialOptimizeProps: Set<string> = new Set()
  node.traverse({
    VariableDeclarator(nodePath) {
      if (!isValidDestructure(nodePath, constObjectName))
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
