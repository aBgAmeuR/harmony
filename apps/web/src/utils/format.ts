export const format = {
  bytes: (value: number | null | undefined): string => {
    if (!value && value !== 0) return '-'
    if (value < 1024) return `${value} B`
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(2)} KB`
    return `${(value / (1024 * 1024)).toFixed(2)} MB`
  },
  duration: (value: number | null | undefined): string => {
    if (!value && value !== 0) return '-'
    if (value < 1000) return `${value.toFixed(0)} ms`
    if (value < 60 * 1000) return `${(value / 1000).toFixed(1)} s`
    if (value < 60 * 60 * 1000) return `${(value / (60 * 1000)).toFixed(1)} min`
    if (value < 24 * 60 * 60 * 1000) return `${(value / (60 * 60 * 1000)).toFixed(1)} h`
    return `${(value / (24 * 60 * 60 * 1000)).toFixed(1)} d`
  },
  date: (value: string | null | undefined | Date): string => {
    if (!value) return '-'
    const date = new Date(value)
    return date.toLocaleDateString()
  },
  time: (value: string | null | undefined | Date): string => {
    if (!value) return '-'
    const date = new Date(value)
    return date.toLocaleTimeString()
  },
}
