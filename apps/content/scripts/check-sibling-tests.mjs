import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const appRoot = path.resolve(scriptDir, '..')

const requiredTargets = [
  'src/app/(page)/projects/_utils',
  'src/utils/api',
  'src/utils/zod.ts',
  'src/bases',
]

function collectTypeScriptFiles(targetPath) {
  const stat = fs.statSync(targetPath)

  if (stat.isFile()) {
    return [targetPath]
  }

  const files = []

  for (const entry of fs.readdirSync(targetPath, { withFileTypes: true })) {
    const entryPath = path.join(targetPath, entry.name)

    if (entry.isDirectory()) {
      files.push(...collectTypeScriptFiles(entryPath))
      continue
    }

    files.push(entryPath)
  }

  return files
}

const targetFiles = requiredTargets
  .flatMap((target) => collectTypeScriptFiles(path.join(appRoot, target)))
  .filter((filePath) => filePath.endsWith('.ts'))
  .filter((filePath) => !filePath.endsWith('.d.ts'))
  .filter((filePath) => !filePath.endsWith('.test.ts'))
  .sort()

const missingTestFiles = targetFiles.filter(
  (filePath) => !fs.existsSync(filePath.replace(/\.ts$/, '.test.ts')),
)

if (missingTestFiles.length === 0) {
  console.log(`All ${targetFiles.length} scoped TypeScript files have sibling .test.ts files.`)
  process.exit(0)
}

console.error('Missing sibling .test.ts files for scoped business logic modules:')
for (const filePath of missingTestFiles) {
  console.error(`- ${path.relative(appRoot, filePath)}`)
}

process.exit(1)
