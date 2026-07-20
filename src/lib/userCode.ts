const KEY = 'habit_user_code'

export function getUserCode(): string | null {
  try {
    const v = localStorage.getItem(KEY)
    return v && v.trim() ? v.trim() : null
  } catch {
    return null
  }
}

export function setUserCode(code: string): void {
  localStorage.setItem(KEY, code.trim())
}

export function clearUserCode(): void {
  localStorage.removeItem(KEY)
}
