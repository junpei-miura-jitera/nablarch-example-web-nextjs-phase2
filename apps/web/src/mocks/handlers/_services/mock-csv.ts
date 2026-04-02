import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseCsvLine } from '../../../app/(page)/projects/_utils/parse-csv-line'

const SHIFT_JIS_DECODER = new TextDecoder('shift_jis')

export function readMockCsvRows(
  importMetaUrl: string,
  relativeFilePath: string,
): Record<string, string>[] {
  const csv = SHIFT_JIS_DECODER.decode(
    readFileSync(resolve(dirname(fileURLToPath(importMetaUrl)), relativeFilePath)),
  )
  const lines = csv
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .filter((line) => line.length > 0)

  const headers = parseCsvLine(lines[0])
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line)
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? '']))
  })
}
