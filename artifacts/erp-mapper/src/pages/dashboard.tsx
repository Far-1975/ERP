import { useGetMappingStats, useGetMappingSessions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ArrowRightLeft, Database, Target, TrendingUp, ChevronRight, Clock } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 0.85 ? "text-emerald-400 bg-emerald-400/10" : value >= 0.65 ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10";
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium ${color}`}>{pct}%</span>;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  order: "Sales Order",
  invoice: "Invoice",
  purchaseorder: "Purchase Order",
  shipment: "Shipment / ASN",
};

const CHART_COLORS = ["#00b4d8", "#0077b6", "#48cae4", "#90e0ef", "#caf0f8", "#023e8a"];

export function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetMappingStats();
  const { data: sessionsData, isLoading: sessionsLoading } = useGetMappingSessions();

  const recentSessions = sessionsData?.sessions?.slice(0, 8) ?? [];
  const erpChartData = (stats?.sessionsByErp ?? []).map(e => ({
    name: e.erpSystemName.replace("Microsoft Dynamics ", "MS Dyn. ").replace(" Cloud", ""),
    count: e.count,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">ERP-to-Canonical Mapping Intelligence</p>
        </div>
        <Link href="/mapper">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <ArrowRightLeft className="w-4 h-4" />
            New Mapping
          </button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sessions</span>
            <Database className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground font-mono">
            {statsLoading ? "—" : (stats?.totalSessions ?? 0)}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fields Mapped</span>
            <Target className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold text-foreground font-mono">
            {statsLoading ? "—" : (stats?.totalFieldsMapped ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avg Confidence</span>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-bold font-mono">
            {statsLoading ? (
              <span className="text-foreground">—</span>
            ) : (
              <span className={
                (stats?.averageConfidenceOverall ?? 0) >= 0.85
                  ? "text-emerald-400"
                  : (stats?.averageConfidenceOverall ?? 0) >= 0.65
                  ? "text-amber-400"
                  : "text-muted-foreground"
              }>
                {Math.round((stats?.averageConfidenceOverall ?? 0) * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Sessions by ERP System</h2>
          {statsLoading || erpChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              {statsLoading ? "Loading..." : "No data yet"}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={erpChartData} barCategoryGap="30%">
                <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 6, fontSize: 12, color: "hsl(var(--foreground))" }}
                  cursor={{ fill: "hsl(var(--accent))" }}
                />
                <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                  {erpChartData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="lg:col-span-3 bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Recent Sessions</h2>
            <Link href="/sessions">
              <span className="text-xs text-primary hover:underline cursor-pointer">View all</span>
            </Link>
          </div>
          {sessionsLoading ? (
            <div className="p-5 text-sm text-muted-foreground">Loading...</div>
          ) : recentSessions.length === 0 ? (
            <div className="p-8 text-center">
              <ArrowRightLeft className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No sessions yet. Run your first mapping.</p>
              <Link href="/mapper">
                <button className="mt-3 text-xs text-primary hover:underline">Start mapping</button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {recentSessions.map(session => (
                <Link key={session.id} href={`/sessions/${session.id}`}>
                  <div className="flex items-center px-5 py-3 hover:bg-accent/50 cursor-pointer transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground truncate">{session.erpSystemName}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                          {DOC_TYPE_LABELS[session.documentType] ?? session.documentType}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.createdAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {session.mappedFields}/{session.totalFields} fields
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ConfidenceBadge value={session.averageConfidence} />
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Doc Type Breakdown */}
      {stats && (stats.sessionsByDocType?.length ?? 0) > 0 && (
        <div className="bg-card border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Sessions by Document Type</h2>
          <div className="flex flex-wrap gap-3">
            {stats.sessionsByDocType.map(dt => (
              <div key={dt.documentType} className="flex items-center gap-2 px-3 py-2 bg-accent/50 rounded-md">
                <span className="text-sm text-foreground font-medium">{DOC_TYPE_LABELS[dt.documentType] ?? dt.documentType}</span>
                <span className="text-xs font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">{dt.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
