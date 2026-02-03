import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: 'src/api.ts',
      name: 'QuantumComputerJS',
      formats: ['es'],
      fileName: 'index',
    },
    outDir: 'dist-lib',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      output: {
        inlineDynamicImports: false,
      },
    },
  },
})
