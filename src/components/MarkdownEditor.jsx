import { useEffect, useRef } from 'react'
import { Editor } from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'
import '@toast-ui/editor/dist/theme/toastui-editor-dark.css'

/** Wrapper Toast UI Editor: tab pratinjau Markdown/WYSIWYG dan tema gelap. */
export default function MarkdownEditor({ value, onChange, height = '420px', dark = false }) {
  const elRef = useRef(null)
  const editorRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const valueRef = useRef(value)

  useEffect(() => {
    onChangeRef.current = onChange
    valueRef.current = value
  })

  useEffect(() => {
    const editor = new Editor({
      el: elRef.current,
      height,
      initialValue: valueRef.current,
      initialEditType: 'markdown',
      previewStyle: 'tab',
      usageStatistics: false,
      theme: dark ? 'dark' : 'light',
      events: { change: () => onChangeRef.current(editor.getMarkdown()) },
    })
    editorRef.current = editor
    return () => editor.destroy()
  }, [height, dark])

  useEffect(() => {
    const editor = editorRef.current
    if (editor.getMarkdown() !== value) editor.setMarkdown(value)
  }, [value])

  return <div ref={elRef} data-testid="markdown-editor" />
}
