import fs from 'fs'
import path from 'path'
import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import execa from 'execa'
import { LoadResult } from 'rollup'

const commit = execa.sync('git', ['rev-parse', 'HEAD']).stdout.slice(0, 7)

function voraVuePlugin(): Plugin {
  return {
    name: 'vora-plugin',
    load(id: string, options?: { ssr?: boolean }): Promise<LoadResult> | LoadResult {
      console.log(id, options)

      if (/test\.js$/.test(id)) {
        return {
          ast: {

          },
          code: `<script setup> console.log('hello!!') </script> <template><div>hi!</div></template>`
        }
      }

      return null
    }
  }
}

export default defineConfig({
  plugins: [vue(), copyVuePlugin(), voraVuePlugin()],
  define: {
    __COMMIT__: JSON.stringify(commit),
    __VUE_PROD_DEVTOOLS__: JSON.stringify(true)
  },
  optimizeDeps: {
    exclude: ['@vue/repl']
  }
})

function copyVuePlugin(): Plugin {
  return {
    name: 'copy-vue',
    generateBundle() {
      const filePath = path.resolve(
        __dirname,
        '../vue/dist/vue.runtime.esm-browser.js'
      )
      if (!fs.existsSync(filePath)) {
        throw new Error(
          `vue.runtime.esm-browser.js not built. ` +
          `Run "nr build vue -f esm-browser" first.`
        )
      }
      this.emitFile({
        type: 'asset',
        fileName: 'vue.runtime.esm-browser.js',
        source: fs.readFileSync(filePath, 'utf-8')
      })
    }
  }
}
