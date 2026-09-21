# rollup-plugin-partial-evaluate

[WIP]

A Rollup plugin to partially evaluate expressions at build time.

## Why this

Third-party Vue components often expose many props, and it's common to use them with static values. For example, you might use a `n-tag` component fron [naive-ui](https://github.com/tusen-ai/naive-ui) like this:

```vue
<template>
  <n-tag
    type="success"
    size="small"
    round
  >
    Success
  </n-tag>
</template>
```

Well, although `n-tag` support closable and many other cool features, you don't need them in this case (you may just want its beautiful colors). But the props are still there, and the component will be larger than it should be.

In this case, you import this plugin and use it like this:

```javascript
// vite.config.js
import PartialEvaluate from 'rollup-plugin-partial-evaluate'

export default {
  plugins: [
    PartialEvaluator({
      silent: true,  // silence the logs
      components: {  // components to be evaluated.
        Tag: {       // check your library `.mjs` filename
          disabled: false,
          checkable: false,
          closable: false,
          onClose: undefined,
        },
      },
      // I guess there are other works can be done with other options
      // like we can optimize not only Vue components but also other mjs files
      // WIP
    }),
  ]
}
```

Then your output `dist/assets/Tag-xxxxxxx.js` will be magically smaller than before! In my case, it's 12.76kb to 9.22kb.

Another example is `n-auto-complete`. After configuration:

```typescript
// If you don't need features below
Input: {
  loading: undefined,
  showCount: false,
  maxlength: undefined,
  pair: false,
  type: '\'text\'',
}
```

It reduces 8.22kb after bundling!

## Context

[rollup#4466](https://github.com/rollup/rollup/issues/4466) discusses the possibility of remove unused default function arguments. This plugin is a proof of concept of a relative idea: We can explicitly specify the values of some props of **Vue components**, and remove the unused code at build time.

[WIP] Although tracking exports and imports is not a trivial task, and consumes a lot of time, we can still do some simple work: For those only **exported once and used once**, we can safely replace arguments with their caller's provided values. In this case, redundant code can be removed.

## How it works

This plugin will parse the AST of the input file, and replace the expressions with their specified values. It's not a simple string replace, but a real AST transformation.
