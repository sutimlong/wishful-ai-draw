import { copyFile, mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import { basename, extname, join } from 'path'

export interface ResolveFilenameOptions {
  sourceFilePath: string
  outputDirectory: string
  namingPattern: string
  outputFormat: string
  index?: number
  timestamp?: number
}

export function formatOutputFileName(options: ResolveFilenameOptions): string {
  const {
    sourceFilePath,
    namingPattern,
    outputFormat,
    index = 1,
    timestamp = Date.now()
  } = options

  const rawExt = extname(sourceFilePath)
  const originalBase = basename(sourceFilePath, rawExt)
  const sanitizedPattern = namingPattern.trim() || '{original_name}_ai_{timestamp}'

  const baseName = sanitizedPattern
    .replace(/\{original_name\}/g, originalBase)
    .replace(/\{timestamp\}/g, String(timestamp))
    .replace(/\{index\}/g, String(index).padStart(3, '0'))
    .replace(/[<>:"/\\|?*]+/g, '_')

  const targetExt = outputFormat.startsWith('.') ? outputFormat : `.${outputFormat}`
  return `${baseName}${targetExt}`
}

export function resolveUniqueFilePath(outputDirectory: string, desiredFileName: string): string {
  const ext = extname(desiredFileName)
  const nameWithoutExt = basename(desiredFileName, ext)

  let candidate = join(outputDirectory, desiredFileName)
  let counter = 1

  while (existsSync(candidate)) {
    candidate = join(outputDirectory, `${nameWithoutExt}_${counter}${ext}`)
    counter++
  }

  return candidate
}

export async function downloadOrSaveOutputImage(params: {
  outputImageUrl: string
  sourceFilePath: string
  outputDirectory: string
  namingPattern: string
  outputFormat: string
  index?: number
  isMockLocalCopy?: boolean
  signal?: AbortSignal
}): Promise<string> {
  const {
    outputImageUrl,
    sourceFilePath,
    outputDirectory,
    namingPattern,
    outputFormat,
    index,
    isMockLocalCopy,
    signal
  } = params

  if (!existsSync(outputDirectory)) {
    await mkdir(outputDirectory, { recursive: true })
  }

  const desiredName = formatOutputFileName({
    sourceFilePath,
    outputDirectory,
    namingPattern,
    outputFormat: isMockLocalCopy ? extname(sourceFilePath).replace('.', '') || outputFormat : outputFormat,
    index
  })

  const finalFilePath = resolveUniqueFilePath(outputDirectory, desiredName)

  if (isMockLocalCopy) {
    await copyFile(sourceFilePath, finalFilePath)
    return finalFilePath
  }

  const response = await fetch(outputImageUrl, { signal })
  if (!response.ok) {
    throw new Error(`下載生成圖片失敗: HTTP ${response.status}`)
  }

  const arrayBuffer = await response.arrayBuffer()
  await writeFile(finalFilePath, Buffer.from(arrayBuffer))
  return finalFilePath
}

