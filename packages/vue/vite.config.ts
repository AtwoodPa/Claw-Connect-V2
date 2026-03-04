import { resolve } from 'node:path';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'OpenClawWebChannelVue',
      fileName: 'openclaw-web-channel-vue'
    },
    rollupOptions: {
      external: ['vue', 'pinia', 'vue-i18n', 'marked', 'highlight.js', '@iconify/vue'],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
          pinia: 'Pinia',
          'vue-i18n': 'VueI18n',
          marked: 'marked',
          'highlight.js': 'hljs',
          '@iconify/vue': 'IconifyVue'
        }
      }
    },
    sourcemap: true
  }
});
