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
import partialEvaluate from 'rollup-plugin-partial-evaluate'

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

## How it works

This plugin will parse the AST of the input file, and replace the expressions with their specified values. It's not a simple string replace, but a real AST transformation.
