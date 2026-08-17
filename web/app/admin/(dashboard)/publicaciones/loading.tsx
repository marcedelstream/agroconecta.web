export default function PublicacionesLoading() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-44 rounded bg-secondary" />
          <div className="h-4 w-20 rounded bg-secondary" />
        </div>
        <div className="h-9 w-32 rounded-xl bg-secondary" />
      </div>

      <div className="flex gap-2 mb-5">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-8 w-24 rounded-xl bg-secondary" />)}
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-bdr">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 px-4 flex items-center gap-4">
              <div className="h-3.5 flex-1 max-w-xs rounded bg-secondary" />
              <div className="h-3 w-24 rounded bg-secondary" />
              <div className="h-3 w-20 rounded bg-secondary" />
              <div className="h-5 w-16 rounded-full bg-secondary" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
