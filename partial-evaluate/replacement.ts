import type { NodePath } from '@babel/traverse'
import type { MemberExpression, ObjectProperty, RestElement, VariableDeclarator } from '@babel/types'
import babel from '@babel/core'
import t from '@babel/types'
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
export function replaceMemberExpression(node: NodePath, constObjectName: string, consts: Record<string, unknown>) {
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
  memberExpressions.forEach((nodePath) => {
    const propNode = nodePath.get('property').node
    if (propNode.type !== 'Identifier')
      return
    const propName = propNode.name
    if (propName in consts) {
      nodePath.replaceWithSourceString(`${consts[propName]}`)
      potentialOptimizeProps.delete(propName)
    }
  })
  logger.log(`Potential optimize member expression: ${Array.from(potentialOptimizeProps).join(', ')}`)
}

function replaceDestructureWithOneConst(
  root: NodePath,
  property: NodePath<ObjectProperty | RestElement>,
  consts: Record<string, unknown>,
  potentialOptimizeProps: Set<string>,
) {
  if (!property.isObjectProperty())
    return
  const key = property.get('key')
  if (!key.isIdentifier())
    return
  const propName = key.node.name
  if (propName in consts) {
    const value = babel.template.expression.ast(`${consts[propName]}`)
    const newVariableDeclarator = t.variableDeclarator(t.identifier(propName), value)
    root.replaceWith(newVariableDeclarator)
  }
  else {
    potentialOptimizeProps.add(propName)
  }
}

function replaceDestructureWithMultiDeclarations(
  root: NodePath,
  properties: NodePath<ObjectProperty | RestElement>[],
  consts: Record<string, unknown>,
  potentialOptimizeProps: Set<string>,
) {
  const deleteProperties: NodePath<ObjectProperty>[] = []
  properties.forEach((property) => {
    if (property.isObjectProperty()) {
      const key = property.get('key')
      if (key.isIdentifier()) {
        const propName = key.node.name
        if (propName in consts)
          deleteProperties.push(property)
        else
          potentialOptimizeProps.add(propName)
      }
    }
  })
  const newVariableDeclarators: VariableDeclarator[] = deleteProperties.map((property) => {
    const key = property.get('key')
    if (!key.isIdentifier())
      throw new Error('Unexpected property key type')
    const propName = key.node.name
    const value = babel.template.expression.ast(`${consts[propName]}`)
    return t.variableDeclarator(t.identifier(propName), value)
  })
  deleteProperties.forEach(property => property.remove())
  root.insertAfter(newVariableDeclarators)
}

/**
 * replace `const { prop } = props` with given const
 * @param node Root node of function body needs to be optimized
 * @param constObjectName Name of the object that contains the constants
 * @param consts Map of constants
 */
export function replaceDestructure(node: NodePath, constObjectName: string, consts: Record<string, unknown>) {
  const potentialOptimizeProps: Set<string> = new Set()
  node.traverse({
    VariableDeclarator(nodePath) {
      if (!isValidDestructure(nodePath, constObjectName))
        return
      const id = nodePath.get('id')
      if (!id.isObjectPattern())
        return
      const properties = id.get('properties')
      if (properties.length === 1)
        replaceDestructureWithOneConst(nodePath, properties[0], consts, potentialOptimizeProps)
      else
        replaceDestructureWithMultiDeclarations(nodePath, properties, consts, potentialOptimizeProps)
    },
  })
  logger.log(`Potential optimize destructure: ${Array.from(potentialOptimizeProps).join(', ')}`)
}
