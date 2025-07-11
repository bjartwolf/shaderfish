import FullReload from 'vite-plugin-full-reload'
import glsl from 'vite-plugin-glsl';
import { resolve } from 'path'
/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    FullReload(['**/*']), glsl()
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
        task4: resolve(__dirname, 'task4/index.html'),
        task5: resolve(__dirname, 'task5/index.html'),
        task6: resolve(__dirname, 'task6/index.html'),
        sokoban: resolve(__dirname, 'sokoban/index.html'),
        cat_demo: resolve(__dirname, 'cat_demo/index.html'),
        day1: resolve(__dirname, 'day1/index.html'),
      }
    }
  }
}


