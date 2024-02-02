// vite.config.js

import path, { resolve } from 'path';

const isDev = process.env.IS_DEV === 'true';
const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, "src")
const cacheInvalidationKeyRef = { current: generateKey() };

export default {
    build: {
        minify: !isDev,
        modulePreload: false,
        reportCompressedSize: !isDev,
        emptyOutDir: false,
        rollupOptions: {
           input: {
               serviceWorker: resolve(srcDir, 'serviceWorker', 'index.ts'),
           },
            output: {
               entryFileNames: 'js/[name]/index.js',
                chunkFileNames: isDev ? 'assets/js/[name].js' : 'assets/js/[name].[hash].js',
                assetFileNames: assetInfo => {
                    const { name } = path.parse(assetInfo.name);
                    const assetFileName = name === 'contentStyle' ? `${name}${getCacheInvalidationKey()}` : name;
                    return `assets/[ext]/${assetFileName}.chunk.[ext]`;
                }
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(srcDir, 'injectedContent'),
        }
    }
}


function getCacheInvalidationKey() {
    return cacheInvalidationKeyRef.current;
}

function generateKey() {
    return `${Date.now().toFixed()}`;
}