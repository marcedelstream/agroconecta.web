export default function ConsultasLoading() {
  return (
    <div className="max-w-5xl animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-56 rounded bg-secondary" />
        <div className="h-4 w-96 rounded bg-secondary" />
      </div>

      <div className="card h-24 mb-6" />

      <div className="flex gap-2 mb-5">
        {[0, 1, 2].map((i) => <div key={i} className="h-8 w-24 rounded-xl bg-secondary" />)}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-bdr">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 px-4 flex items-center gap-4">
              <div className="h-3 w-20 rounded bg-secondary" />
              <div className="h-3 w-28 rounded bg-secondary" />
              <div className="h-3 flex-1 rounded bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
