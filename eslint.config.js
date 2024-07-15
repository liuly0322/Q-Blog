import antfu from '@antfu/eslint-config'

export default antfu({
  rules: {
    'ts/no-unused-expressions': ['off'],
    'unused-imports/no-unused-vars': ['off'],
  },
})
