export type Platform =
  | 'android'
  | 'ios'
  | 'linux'
  | 'windows'
  | 'web_player'
  | 'not_applicable'
  | 'other'

export function normalizePlatform(raw: string | null): Platform {
  const s = (raw ?? '').trim()
  if (!s) return 'other'
  const lower = s.toLowerCase()

  if (lower.includes('web_player')) return 'web_player'
  if (lower.includes('android')) return 'android'
  if (
    lower.includes('ios') ||
    lower.includes('iphone') ||
    lower.includes('os x') ||
    lower.includes('macos')
  )
    return 'ios'
  if (lower.includes('linux')) return 'linux'
  if (lower.includes('windows')) return 'windows'
  if (lower.includes('partner') || lower === 'not_applicable' || lower === 'not applicable')
    return 'not_applicable'

  return 'other'
}
