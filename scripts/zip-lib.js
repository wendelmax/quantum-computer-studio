import { createWriteStream, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const distLib = join(root, 'dist-lib')
const publicDir = join(root, 'public')
const outZip = join(publicDir, 'quantum-computer-js-lib.zip')

async function run() {
  if (!existsSync(distLib)) {
    console.error('dist-lib not found. Run npm run build:lib first.')
    process.exit(1)
  }
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })

  const archiver = (await import('archiver')).default
  const output = createWriteStream(outZip)
  const archive = archiver('zip', { zlib: { level: 9 } })

  await new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log('Created public/quantum-computer-js-lib.zip')
      resolve()
    })
    archive.on('error', reject)
    archive.pipe(output)
    archive.directory(distLib, 'quantum-computer-js-lib')
    archive.finalize()
  })
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
