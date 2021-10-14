import { join } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
require('dotenv').config({ path: join(__dirname, '.env') })

export default defineConfig(env => {
  return {
    plugins: [
      vue(),
    ],
    root: join(__dirname, 'src/render'),
    base: './',
    server: {
      port: +process.env.PORT,
    },
    resolve: {
      alias: {
        '@root': __dirname,
        '@': join(__dirname, 'src'),
      },
    },
    build: {
      outDir: join(__dirname, 'dist/render'),
      emptyOutDir: true,
      minify: process.env.NODE_ENV === "production",
      commonjsOptions: {},
      sourcemap: process.env.NODE_ENV !== "production",
    },
  }
})
