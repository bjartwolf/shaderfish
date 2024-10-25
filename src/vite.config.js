import FullReload from 'vite-plugin-full-reload'
import { resolve } from 'path'
/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    FullReload(['**/*']),
  ],
  assetsInclude: ['**/*.png', '**/*.glb', '**/*.glsl'],
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        task1: resolve(__dirname, 'task1/index.html'),
        task2: resolve(__dirname, 'task2/index.html'),
        task3: resolve(__dirname, 'task3/index.html'),
      }
    }
  }
}


