import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

describe('package exports', () => {
  it('keeps a fallback root export for non-import resolvers', () => {
    const packageJson = JSON.parse(
      readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8'),
    )

    const rootExport = packageJson.exports['.']

    expect(rootExport).toMatchObject({
      types: './dist/types.d.mts',
      import: './dist/module.mjs',
      default: './dist/module.mjs',
    })
  })
})
