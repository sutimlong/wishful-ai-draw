import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import {
  downloadOrSaveOutputImage,
  formatOutputFileName,
  resolveUniqueFilePath
} from '../src/main/services/imageDownloader'

describe('imageDownloader', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'wishful-test-'))
  })

  afterEach(() => {
    if (tempDir && existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true })
    }
  })

  it('formats output filename using template variables', () => {
    const fileName = formatOutputFileName({
      sourceFilePath: '/Users/test/photos/portrait.jpg',
      outputDirectory: tempDir,
      namingPattern: '{original_name}_ai_{index}_{timestamp}',
      outputFormat: 'png',
      index: 7,
      timestamp: 1700000000
    })

    expect(fileName).toBe('portrait_ai_007_1700000000.png')
  })

  it('resolves non-colliding file paths when file already exists', () => {
    const desired = 'sample_ai.png'
    const firstPath = resolveUniqueFilePath(tempDir, desired)
    expect(firstPath).toBe(join(tempDir, 'sample_ai.png'))

    // Create the first file so next resolution appends _1
    writeFileSync(firstPath, 'dummy')
    const secondPath = resolveUniqueFilePath(tempDir, desired)
    expect(secondPath).toBe(join(tempDir, 'sample_ai_1.png'))

    writeFileSync(secondPath, 'dummy2')
    const thirdPath = resolveUniqueFilePath(tempDir, desired)
    expect(thirdPath).toBe(join(tempDir, 'sample_ai_2.png'))
  })

  it('saves output file in mock local copy mode without overwriting', async () => {
    const srcFile = join(tempDir, 'input_photo.png')
    writeFileSync(srcFile, 'fake-image-binary-content')

    const outDir = join(tempDir, 'output')
    const saved1 = await downloadOrSaveOutputImage({
      outputImageUrl: 'https://mock.fal.media/input_photo.png',
      sourceFilePath: srcFile,
      outputDirectory: outDir,
      namingPattern: '{original_name}_out',
      outputFormat: 'png',
      isMockLocalCopy: true
    })

    const saved2 = await downloadOrSaveOutputImage({
      outputImageUrl: 'https://mock.fal.media/input_photo.png',
      sourceFilePath: srcFile,
      outputDirectory: outDir,
      namingPattern: '{original_name}_out',
      outputFormat: 'png',
      isMockLocalCopy: true
    })

    expect(existsSync(saved1)).toBe(true)
    expect(existsSync(saved2)).toBe(true)
    expect(saved1).not.toBe(saved2)
  })
})

