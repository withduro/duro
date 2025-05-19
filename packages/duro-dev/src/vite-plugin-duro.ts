// packages/duro-dev/src/vite-plugin-duro.ts

import { Plugin } from 'vite'
import { renderDuroFile } from './index.js'

export function DuroPlugin(): Plugin {
  return {
    name: 'vite-plugin-duro',
    enforce: 'pre',

    transform(src, id) {
      if (!id.endsWith('.duro')) return null;

      // .duro fayl matnini HTML ga aylantiramiz
      const html = renderDuroFile(src);

      // Natijani JS moduli sifatida export qilamiz
      return {
        code: `export default ${JSON.stringify(html)}`,
        map: null
      };
    }
  }
}
