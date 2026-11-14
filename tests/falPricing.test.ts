import { describe, expect, it } from 'vitest'
import {
  ASSUMED_OUTPUT_MEGAPIXELS,
  describeModelPricing,
  estimateBatchCostUsd,
  estimatePerImageCostUsd,
  formatModelPriceTag,
  formatPerImagePrice,
  formatPriceUsd,
  formatUnitLabel,
  formatUnitPrice
} from '../src/shared/falPricing'
import { FalModelPreset } from '../src/shared/types'

describe('falPricing 價格格式化', () => {
  it('formatPriceUsd 依金額大小決定小數位數', () => {
    expect(formatPriceUsd(1.5)).toBe('$1.50')
    expect(formatPriceUsd(0.04)).toBe('$0.04')
    expect(formatPriceUsd(0.0398)).toBe('$0.04')
    expect(formatPriceUsd(0.006)).toBe('$0.006')
    expect(formatPriceUsd(0.0019)).toBe('$0.0019')
    expect(formatPriceUsd(0.00194)).toBe('$0.00194')
    expect(formatPriceUsd(0.0006)).toBe('$0.0006')
    expect(formatPriceUsd(0)).toBe('$0.00')
    expect(formatPriceUsd(Number.NaN)).toBe('$0.00')
  })

  it('formatUnitLabel 將 fal 計價單位轉成中文', () => {
    expect(formatUnitLabel('images')).toBe('張')
    expect(formatUnitLabel('megapixels')).toBe('MP')
    expect(formatUnitLabel('processed megapixels')).toBe('MP（輸入＋輸出）')
    expect(formatUnitLabel('compute seconds')).toBe('運算秒')
    expect(formatUnitLabel('unknown-unit')).toBe('unknown-unit')
  })

  it('formatPerImagePrice 只在有單張金額時回傳字串，估算值加上 ~', () => {
    expect(formatPerImagePrice({ unit: 'images', perImageUsd: 0.04, basis: 'fal 計價單位：每張' })).toBe(
      '$0.04 / 張'
    )
    expect(
      formatPerImagePrice({ unit: 'megapixels', perImageUsd: 0.03, isEstimate: true, basis: 'x' })
    ).toBe('~$0.03 / 張')
    expect(formatPerImagePrice({ unit: 'compute seconds', basis: 'x' })).toBeUndefined()
    expect(formatPerImagePrice({ unit: 'images', perImageUsd: 0, basis: 'x' })).toBeUndefined()
    expect(formatPerImagePrice(undefined)).toBeUndefined()
  })

  it('formatUnitPrice 顯示 fal 原始計價基準', () => {
    expect(formatUnitPrice({ unit: 'compute seconds', unitPriceUsd: 0.00194, basis: 'x' })).toBe(
      '$0.00194 / 運算秒'
    )
    expect(formatUnitPrice({ unit: 'seconds', unitPriceUsd: 0.013, basis: 'x' })).toBe('$0.01 / 秒')
    expect(formatUnitPrice({ unit: 'compute seconds', basis: 'x' })).toBeUndefined()
  })

  it('formatModelPriceTag 優先顯示單張金額，其次計價基準', () => {
    expect(
      formatModelPriceTag({
        unit: 'images',
        perImageUsd: 0.04,
        unitPriceUsd: 0.04,
        basis: 'fal 計價單位：每張'
      })
    ).toBe('$0.04 / 張')
    expect(formatModelPriceTag({ unit: 'compute seconds', unitPriceUsd: 0.00194, basis: '' })).toBe(
      '$0.00194 / 運算秒'
    )
    expect(formatModelPriceTag({ unit: 'units', basis: '依 token 用量計價，無法換算單張金額' })).toBe(
      '依 token 用量'
    )
    // token 計價的「單位價」不是單張費用，不可顯示成 $1.00 / 單位
    expect(
      formatModelPriceTag({
        unit: 'units',
        unitPriceUsd: 1,
        basis: '依 token 用量計價，無法換算單張金額'
      })
    ).toBe('依 token 用量')
    expect(formatModelPriceTag({ unit: 'compute seconds', basis: 'fal 未公布單價' })).toBe('未公布單價')
    expect(formatModelPriceTag(undefined)).toBe('未公布單價')
  })

  it('describeModelPricing 會附上換算依據', () => {
    expect(
      describeModelPricing({
        unit: 'megapixels',
        perImageUsd: 0.03,
        isEstimate: true,
        unitPriceUsd: 0.03,
        basis: '$0.03 / MP × 約 1 MP（1024×1024）'
      })
    ).toBe('~$0.03 / 張 · $0.03 / MP × 約 1 MP（1024×1024）')
    expect(
      describeModelPricing({
        unit: 'units',
        unitPriceUsd: 1,
        basis: '依 token 用量計價，無法換算單張金額'
      })
    ).toBe('依 token 用量計價，無法換算單張金額')
    expect(describeModelPricing(undefined)).toBe('fal.ai 未提供此端點的計價資訊')
  })

  it('單張價格可換算批次預估費用', () => {
    const model: FalModelPreset = {
      id: 'fal-ai/nano-banana/edit',
      name: 'Nano Banana Edit',
      description: '',
      imageInputField: 'image_url',
      pricing: { unit: 'images', perImageUsd: 0.0398, basis: 'fal 公布每張價格' },
      defaultParams: {}
    }

    expect(estimatePerImageCostUsd(model)).toBe(0.0398)
    expect(estimateBatchCostUsd(model, 10)).toBeCloseTo(0.398, 5)
    expect(estimateBatchCostUsd(model, 0)).toBeUndefined()

    const unknown: FalModelPreset = { ...model, pricing: { unit: 'unknown', basis: 'fal 未公布單價' } }
    expect(estimatePerImageCostUsd(unknown)).toBeUndefined()
    expect(estimateBatchCostUsd(unknown, 5)).toBeUndefined()
  })

  it('換算基準以 1024×1024（約 1 MP）估算', () => {
    expect(ASSUMED_OUTPUT_MEGAPIXELS).toBe(1)
  })
})
