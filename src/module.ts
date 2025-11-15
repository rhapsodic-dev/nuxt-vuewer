import { defineNuxtModule, createResolver, addImports } from '@nuxt/kit'
import { fileURLToPath } from 'node:url'

export default defineNuxtModule({
  meta: {
    name: 'nuxt-vuewer',
    configKey: 'vuewer',
    compatibility: { nuxt: '>=3.1.0 || ^4' },
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = fileURLToPath(new URL('./runtime', import.meta.url))

    _nuxt.options.build.transpile.push(runtimeDir)
    _nuxt.options.css.push(resolve(runtimeDir, 'assets/global.css'))

    addImports({
      name: 'useVuewer',
      as: 'useVuewer',
      from: resolve(runtimeDir, 'composables/vuewer'),
    })
  },
})
