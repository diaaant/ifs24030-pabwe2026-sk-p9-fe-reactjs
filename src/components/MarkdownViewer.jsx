import { useEffect, useRef } from 'react'
import Viewer from '@toast-ui/editor/viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

/** Wrapper Toast UI Viewer: merender Markdown secara aman (HTML disanitasi). */
export default function MarkdownViewer({ content, dark = false }) {
  const elRef = useRef(null)

  useEffect(() => {
    const viewer = new Viewer({ el: elRef.current, initialValue: content, usageStatistics: false })
    return () => viewer.destroy()
  }, [content])

  return <div ref={elRef} data-testid="markdown-viewer" className={dark ? 'toastui-editor-dark' : ''} />
}
