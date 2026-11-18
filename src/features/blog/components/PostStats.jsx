const EMPTY = { total: 0, total_terbit: 0, total_draf: 0 }

/** Tiga kartu statistik: Total Artikel, Terbit, Draf. */
export default function PostStats({ stats = EMPTY }) {
  const cards = [
    { label: 'Total Artikel', value: stats.total, tone: 'text-accent' },
    { label: 'Total Terbit', value: stats.total_terbit, tone: 'text-emerald-600' },
    { label: 'Draf', value: stats.total_draf, tone: 'text-amber-600' },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className={`mt-1 text-3xl font-bold ${card.tone}`}>{card.value}</p>
        </div>
      ))}
    </div>
  )
}
