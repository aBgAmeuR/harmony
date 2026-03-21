import { randomInt } from 'node:crypto'

const PUBLIC_ID_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
const DEFAULT_PUBLIC_ID_LENGTH = 12

export function generatePublicId(length: number = DEFAULT_PUBLIC_ID_LENGTH): string {
  let output = ''

  for (let i = 0; i < length; i++) {
    output += PUBLIC_ID_ALPHABET[randomInt(0, PUBLIC_ID_ALPHABET.length)]
  }

  return output
}
