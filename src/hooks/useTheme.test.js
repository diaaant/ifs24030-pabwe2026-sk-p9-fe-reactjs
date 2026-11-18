import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useTheme, { ACCENTS } from './useTheme'

const stubDarkPreference = (matches) =>
  vi.spyOn(window, 'matchMedia').mockReturnValue({ matches })

beforeEach(() => {
  localStorage.clear()
  document.documentElement.className = ''
  delete document.documentElement.dataset.accent
})
afterEach(() => vi.restoreAllMocks())

describe('useTheme', () => {
  it('follows the system preference when nothing is saved', () => {
    stubDarkPreference(true)
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(result.current.accent).toBe(ACCENTS[0])
    expect(document.documentElement.dataset.accent).toBe('indigo')
  })

  it('falls back to light when the system prefers light', () => {
    stubDarkPreference(false)
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('restores saved theme and accent, and toggles both ways', () => {
    localStorage.setItem('delcom_theme', 'dark')
    localStorage.setItem('delcom_accent', 'rose')
    const { result } = renderHook(() => useTheme())

    expect(result.current.theme).toBe('dark')
    expect(result.current.accent).toBe('rose')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('light')
    expect(localStorage.getItem('delcom_theme')).toBe('light')

    act(() => result.current.toggleTheme())
    expect(result.current.theme).toBe('dark')

    act(() => result.current.setAccent('emerald'))
    expect(document.documentElement.dataset.accent).toBe('emerald')
    expect(localStorage.getItem('delcom_accent')).toBe('emerald')
  })
})
