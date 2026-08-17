export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex items-center justify-center font-bold">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p>Loading Dashboard...</p>
      </div>
    </div>
  );
}
