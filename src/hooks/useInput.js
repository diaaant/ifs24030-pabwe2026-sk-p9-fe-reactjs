import { useCallback, useState } from 'react'

/** State input dua arah: [value, onChange, reset, setValue]. Mendukung checkbox. */
export default function useInput(initial = '') {
  const [value, setValue] = useState(initial)

  const onChange = useCallback((event) => {
    const { type, checked, value: next } = event.target
    setValue(type === 'checkbox' ? checked : next)
  }, [])

  const reset = useCallback(() => setValue(initial), [initial])

  return [value, onChange, reset, setValue]
}
