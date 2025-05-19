

export default function Page() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <h1 className="text-2xl font-bold">Events Management</h1>
          <p className="text-muted-foreground">Manage all events for your organization</p>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary">
              <span className="icon-plus mr-2"></span> Create Event
            </button>
            <button className="btn btn-secondary">
              <span className="icon-refresh mr-2"></span> Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
