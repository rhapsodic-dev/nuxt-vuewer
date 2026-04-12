import { addImports, defineNuxtModule } from '@nuxt/kit'

const PACKAGE_NAME = '@rhapsodic/vuewer'
const PACKAGE_STYLE = `${PACKAGE_NAME}/style.css`

export interface ModuleOptions {
  css?: boolean
  autoImport?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@rhapsodic/nuxt-vuewer',
    configKey: 'vuewer',
    compatibility: { nuxt: '>=3.1.0 || ^4' },
  },
  defaults: {
    css: true,
    autoImport: true,
  },
  setup(options, nuxt) {
    if (!nuxt.options.build.transpile.includes(PACKAGE_NAME)) {
      nuxt.options.build.transpile.push(PACKAGE_NAME)
    }

    if (options.css && !nuxt.options.css.includes(PACKAGE_STYLE)) {
      nuxt.options.css.push(PACKAGE_STYLE)
    }

    if (options.autoImport) {
      addImports({
        name: 'useVuewer',
        from: PACKAGE_NAME,
      })
    }
  },
})
