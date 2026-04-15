import { type LayoutStorage } from 'react-resizable-panels'

export const cookieStorage: LayoutStorage = {
  getItem(key: string) {
    const cookies = document.cookie.split(';')

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')

      if (name === key) {
        return value
      }
    }

    return null
  },

  setItem(key: string, value: string) {
    document.cookie = `${key}=${value}; path=/;`
  },
}
