import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import useInput from './useInput'

describe('useInput', () => {
  it('defaults to an empty string and handles text changes', () => {
    const { result } = renderHook(() => useInput())
    expect(result.current[0]).toBe('')

    act(() => result.current[1]({ target: { type: 'text', value: 'halo' } }))
    expect(result.current[0]).toBe('halo')
  })

  it('handles checkboxes, setValue and reset', () => {
    const { result } = renderHook(() => useInput(false))

    act(() => result.current[1]({ target: { type: 'checkbox', checked: true, value: 'on' } }))
    expect(result.current[0]).toBe(true)

    act(() => result.current[3](false))
    expect(result.current[0]).toBe(false)

    act(() => result.current[1]({ target: { type: 'checkbox', checked: true } }))
    act(() => result.current[2]())
    expect(result.current[0]).toBe(false)
  })
})
