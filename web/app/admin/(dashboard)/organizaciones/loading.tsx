export default function OrganizacionesLoading() {
  return (
    <div className="max-w-6xl animate-pulse">
      <div className="mb-6 space-y-2">
        <div className="h-7 w-48 rounded bg-secondary" />
        <div className="h-4 w-24 rounded bg-secondary" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <div className="card h-96" />
        <div className="card p-0 overflow-hidden">
          <div className="divide-y divide-bdr">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 px-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-secondary" />
                  <div className="h-3 w-1/5 rounded bg-secondary" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
