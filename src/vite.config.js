import { defineConfig } from 'vite'
import FullReload from 'vite-plugin-full-reload'

/** @type {import('vite').UserConfig} */
export default {
  plugins: [
    FullReload(['**/*'])
  ],
  assetsInclude: ['**/*.png', '**/*.glb', '**/*.glsl'],
  build: {
    target: 'esnext'
  }
  // ...
}


