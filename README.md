# @rhapsodic/nuxt-vuewer

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

> Image viewer for your [Nuxt](https://nuxt.com/)️ project

## Features

- 💪 &nbsp;Type safe integration of Vuewer into your project
- ✨ &nbsp;Viewing multiple or a single image
- 🕹️ &nbsp;A `useVuewer()` composable to access all of vuewer methods.

## Quick Setup

Install the module to your Nuxt application with one command:

```bash
npx nuxi module add @rhapsodic/nuxt-vuewer
```

That's it! You can now use Vuewer in your Nuxt app ✨

## Usage
```vue
<script setup>
const { open, close, isOpened } = useVuewer({
  images: [
    'https://placehold.net/2.png',
    'https://placehold.net/5-600x800.png',
    'https://placehold.net/7-600x800.png',
  ],
})

watch(isOpened, (newState) => {
  console.log(`Vuewer state: ${newState ? 'opened' : 'closed'}`)
})
</script>

<template>
  <div>
    <button @click="open">
      Open Vuewer
    </button>
  </div>
</template>
```


## Development

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

## License

[MIT License](./LICENSE)

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/@rhapsodic/nuxt-vuewer/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/@rhapsodic/nuxt-vuewer

[npm-downloads-src]: https://img.shields.io/npm/dm/@rhapsodic/nuxt-vuewer.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/@rhapsodic/nuxt-vuewer

[license-src]: https://img.shields.io/npm/l/@rhapsodic/nuxt-vuewer.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/@rhapsodic/nuxt-vuewer
