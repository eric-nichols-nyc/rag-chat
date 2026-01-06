type StatsDisplayProps = {
  stats: { total: number; active: number };
};

/**
 * Component responsible ONLY for displaying statistics
 */
export function StatsDisplay({ stats }: StatsDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-sm text-muted-foreground">Total Users</p>
        <p className="text-2xl font-bold">{stats.total}</p>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">Active Users</p>
        <p className="text-2xl font-bold">{stats.active}</p>
      </div>
    </div>
  );
}

