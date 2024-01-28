// vite.config.js

import path, { resolve } from 'path';

const isDev = process.env.IS_DEV === 'true';
const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, "src")

export default {
    build: {
        minify: !isDev,
        rollupOptions: {
           input: {
               popup: resolve(srcDir, 'popup', 'index.html'),
               contentInjected: resolve(srcDir, 'injectedContent', 'index.ts'),
           },
            output: {
               entryFileNames: 'src/pages/[name]/index.js',
                chunkFileNames: isDev ? 'assets/js/[name].js' : 'assets/js/[name].[hash].js',
                assetFileNames: assetInfo => {
                    const { name } = path.parse(assetInfo.name);
                    const assetFileName = name === 'contentStyle' ? `${name}${getCacheInvalidationKey()}` : name;
                    return `assets/[ext]/${assetFileName}.chunk.[ext]`;
                }
            }
        }
    }
}