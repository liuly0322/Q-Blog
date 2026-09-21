/**
 * Count occurrences of each element in an array
 * @param arr Array of elements to count
 * @returns Map of element to count
 */
export function counter<T>(arr: Array<T>): Map<T, number> {
  return arr.reduce(
    (acc: Map<T, number>, e: T) => acc.set(e, (acc.get(e) || 0) + 1),
    new Map(),
  )
}
