import { useState } from 'react'
import { IconSparkles, IconX } from '@tabler/icons-react'
import MarkdownViewer from '../../../components/MarkdownViewer'
import useInput from '../../../hooks/useInput'
import { CATEGORIES, aiGenerate } from '../api/blogApi'

const fieldClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-accent dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100'

/** Modal full screen AI Blog Generator dengan opsi penelusuran Search Engine. */
export default function AiPostGeneratorModal({ dark, onClose, onApply }) {
  const [topic, onTopic] = useInput('')
  const [category, onCategory] = useInput('')
  const [webSearch, onWebSearch] = useInput(true)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const generate = async () => {
    if (!topic.trim()) {
      setError('Topik wajib diisi')
      return
    }
    setError('')
    setLoading(true)
    try {
      setResult(await aiGenerate({ topic, category, include_web_search: webSearch }))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2" role="dialog" aria-modal="true" aria-label="AI Generator">
      <div className="flex h-[96vh] w-full max-w-[96vw] flex-col overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between bg-[var(--accent)] px-6 py-4 text-white">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <IconSparkles size={20} /> AI Blog Generator
          </h2>
          <button type="button" aria-label="Tutup" onClick={onClose}>
            <IconX size={22} />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {error && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {error}
            </p>
          )}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label htmlFor="ai-topic" className="mb-1 block text-sm font-medium">
                Topik artikel
              </label>
              <input id="ai-topic" className={fieldClass} value={topic} onChange={onTopic} placeholder="Contoh: Tren AI generatif 2026" />
            </div>
            <div>
              <label htmlFor="ai-category" className="mb-1 block text-sm font-medium">
                Kategori
              </label>
              <select id="ai-category" className={fieldClass} value={category} onChange={onCategory}>
                <option value="">Otomatis</option>
                {CATEGORIES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={webSearch} onChange={onWebSearch} /> Sertakan penelusuran Search Engine (fakta terkini)
          </label>
          <button type="button" onClick={generate} disabled={loading} className="btn-accent rounded-lg px-5 py-2 text-sm font-semibold">
            {loading ? 'Menghasilkan...' : 'Generate Artikel'}
          </button>

          {result && (
            <div className="space-y-3 rounded-xl border border-slate-200 p-5 dark:border-slate-700">
              <h3 className="text-2xl font-bold">{result.title}</h3>
              <p className="text-sm text-slate-500">
                {result.category} · {result.excerpt}
              </p>
              <MarkdownViewer content={result.content} dark={dark} />
              {result.sources.length > 0 && (
                <div>
                  <h4 className="font-semibold">Sumber rujukan</h4>
                  <ol className="list-decimal pl-5 text-sm">
                    {result.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer" className="text-accent underline">
                          {source.title}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 bg-slate-800 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-slate-500 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700">
            Batal
          </button>
          <button type="button" disabled={!result} onClick={() => onApply(result)} className="btn-accent rounded-lg px-5 py-2 text-sm font-semibold">
            Gunakan Draf
          </button>
        </div>
      </div>
    </div>
  )
}
