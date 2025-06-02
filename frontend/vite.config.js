import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import path from 'path'

export default defineConfig({
  plugins: [
    createVuePlugin({
      jsx: true, // JSX support
      vueTemplateOptions: {
        compilerOptions: {
          whitespace: 'condense'
        }
      }
    })
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': path.resolve(__dirname, './node_modules/vue/dist/vue.esm.js'),
      'assets': path.resolve(__dirname, './src/assets')
    },
    extensions: ['.js', '.vue', '.json', '.scss']
  },

  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `
          @import "assets/scss/_variables.scss";
          @import "assets/scss/_mixins.scss";
        `,
        charset: false
      }
    }
  },

  server: {
    port: 3000,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
        ws: true
      }
    },
    hmr: {
      overlay: false
    }
  },

  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'vuex'],
          vcalendar: ['v-calendar'],
          axios: ['axios', 'vue-axios'],
          vendor: ['lodash', 'moment']
        }
      }
    }
  },

  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'axios',
      'v-calendar',
      'vue-axios'
    ],
    exclude: ['vue-demi']
  },

  define: {
    'process.env': {},
    '__VUE_PROD_DEVTOOLS__': false
  }
})
