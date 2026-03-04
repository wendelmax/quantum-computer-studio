import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, '../quantum-computer-js-lib/src/index.ts'),
            name: 'QuantumJS',
            fileName: (format) => `index.${format === 'es' ? 'es' : 'umd'}.js`,
            formats: ['es', 'umd']
        },
        outDir: 'dist-lib',
        rollupOptions: {
            external: [],
            output: {
                globals: {}
            }
        }
    },
    plugins: [dts({
        include: [resolve(__dirname, '../quantum-computer-js-lib/src')],
        outDir: 'dist-lib'
    })]
})
