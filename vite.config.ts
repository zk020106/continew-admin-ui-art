import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import ElementPlus from 'unplugin-element-plus/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'
import viteCompression from 'vite-plugin-compression'
import vueDevTools from 'vite-plugin-vue-devtools'
// import { visualizer } from 'rollup-plugin-visualizer'

export default ({ mode }: { mode: string }) => {
  const root = process.cwd()
  const env = loadEnv(mode, root)
  const {
    VITE_VERSION,
    VITE_PORT,
    VITE_BASE_URL,
    VITE_API_URL,
    VITE_API_PROXY_URL
  } = env

  console.log(`🚀 API_URL = ${VITE_API_URL}`)
  console.log(`🚀 VERSION = ${VITE_VERSION}`)
  console.log(`🚀 BASE_URL = ${VITE_BASE_URL}`)

  return defineConfig({
    define: {
      __APP_VERSION__: JSON.stringify(VITE_VERSION)
    },
    base: VITE_BASE_URL,
    server: {
      port: Number(VITE_PORT),
      proxy: {
        [VITE_API_URL]: {
          target: VITE_API_PROXY_URL, // 后台服务器地址
          changeOrigin: true, // 是否允许不同源
          secure: false, // 支持https
          rewrite: (path) => path.replace(new RegExp(`^${VITE_API_URL}`), '')
        }
      },
      host: true
    },
    // 路径别名
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
        { find: '@views', replacement: resolvePath('src/views') },
        { find: '@imgs', replacement: resolvePath('src/assets/images') },
        { find: '@icons', replacement: resolvePath('src/assets/icons') },
        { find: '@utils', replacement: resolvePath('src/utils') },
        { find: '@stores', replacement: resolvePath('src/store') },
        { find: '@styles', replacement: resolvePath('src/assets/styles') },
        // 仅替换包根路径，避免误改写 @vue-office/* 的子路径导入（如样式文件）
        {
          find: /^@vue-office\/pdf$/,
          replacement: path.resolve(__dirname, 'node_modules/@vue-office/pdf/lib/v3/vue-office-pdf.mjs')
        },
        {
          find: /^@vue-office\/excel$/,
          replacement: path.resolve(__dirname, 'node_modules/@vue-office/excel/lib/v3/vue-office-excel.mjs')
        },
        {
          find: /^@vue-office\/docx$/,
          replacement: path.resolve(__dirname, 'node_modules/@vue-office/docx/lib/v3/vue-office-docx.mjs')
        }
      ]
    },
    build: {
      target: 'es2015',
      outDir: 'dist',
      chunkSizeWarningLimit: 2000,
      minify: 'terser',
      sourcemap: false, // 不生成 source map，减少包体积
      rollupOptions: {
        output: {
          // 手动分包策略
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('echarts')) {
                return 'vendor-echarts'
              }
              if (id.includes('element-plus')) {
                return 'vendor-element-plus'
              }
              if (id.includes('@vue-office') || id.includes('xlsx')) {
                return 'vendor-office'
              }
              return 'vendor'
            }
          },
          // 优化 chunk 命名
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
        }
      },
      terserOptions: {
        compress: {
          // 生产环境去除 console
          drop_console: true,
          // 生产环境去除 debugger
          drop_debugger: true,
          // 移除无用代码
          dead_code: true,
          // 优化条件语句
          conditionals: true,
          // 优化布尔值
          booleans: true
        },
        format: {
          // 移除注释
          comments: false
        }
      },
      dynamicImportVarsOptions: {
        warnOnError: true,
        exclude: [],
        include: ['src/views/**/*.vue']
      }
    },
    plugins: [
      vue(),
      tailwindcss(),
      vueJsx(),
      // 自动按需导入 API
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
        dts: 'src/types/import/auto-imports.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      // 自动按需导入组件
      Components({
        dts: 'src/types/import/components.d.ts',
        resolvers: [ElementPlusResolver()]
      }),
      // gzip 压缩
      viteCompression({
        verbose: false, // 是否在控制台输出压缩结果
        disable: false, // 是否禁用
        algorithm: 'gzip', // 压缩算法
        ext: '.gz', // 压缩后的文件名后缀
        threshold: 10240, // 只有大小大于该值的资源会被处理 10240B = 10KB
        deleteOriginFile: false // 压缩后是否删除原文件
      }),
      // 条件化启用 Vue DevTools（仅在需要调试时启用）
      ...(process.env.VITE_ENABLE_DEVTOOLS === 'true' ? [vueDevTools()] : [])
      // 打包分析
      // visualizer({
      //   open: true,
      //   gzipSize: true,
      //   brotliSize: true,
      //   filename: 'dist/stats.html' // 分析图生成的文件名及路径
      // }),
    ],
    // 依赖预构建：避免运行时重复请求与转换，提升首次加载速度
    optimizeDeps: {
      include: [
        'echarts/core',
        'echarts/charts',
        'echarts/components',
        'echarts/renderers',
        'xlsx',
        'xgplayer',
        'crypto-js',
        'file-saver',
        'vue-img-cutter',
        'element-plus/es',
        'element-plus/es/components/*/style/css',
        'element-plus/es/components/*/style/index'
      ]
    },
    css: {
      preprocessorOptions: {
        // sass variable and mixin
        scss: {
          additionalData: `
            @use "@styles/core/el-light.scss" as *; 
            @use "@styles/core/mixin.scss" as *;
          `
        }
      },
      postcss: {
        plugins: [
          {
            postcssPlugin: 'internal:charset-removal',
            AtRule: {
              charset: (atRule) => {
                if (atRule.name === 'charset') {
                  atRule.remove()
                }
              }
            }
          }
        ]
      }
    }
  })
}

function resolvePath(paths: string) {
  return path.resolve(__dirname, paths)
}
