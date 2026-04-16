import { useGetMappingSessions } from "@workspace/api-client-react";
import { Link } from "wouter";
import { ArrowRightLeft, ChevronRight, Clock, CheckCircle, AlertTriangle } from "lucide-react";

const DOC_TYPE_LABELS: Record<string, string> = {
  order: "Sales Order",
  invoice: "Invoice",
  purchaseorder: "Purchase Order",
  shipment: "Shipment / ASN",
};

function ConfidenceBadge({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  if (value >= 0.85) return <span className="px-2 py-0.5 rounded text-xs font-mono font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">{pct}%</span>;
  if (value >= 0.65) return <span className="px-2 py-0.5 rounded text-xs font-mono font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20">{pct}%</span>;
  return <span className="px-2 py-0.5 rounded text-xs font-mono font-medium text-red-400 bg-red-400/10 border border-red-400/20">{pct}%</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function Sessions() {
  const { data, isLoading } = useGetMappingSessions();
  const sessions = data?.sessions ?? [];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Session History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{sessions.length} mapping session{sessions.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/mapper">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
            <ArrowRightLeft className="w-4 h-4" />
            New Mapping
          </button>
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-lg p-8 text-center text-sm text-muted-foreground">
          Loading sessions...
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <ArrowRightLeft className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">No mapping sessions yet.</p>
          <Link href="/mapper">
            <button className="mt-3 text-sm text-primary hover:underline">Run your first mapping</button>
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">ERP System</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Document Type</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fields</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mapped</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Confidence</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map(session => {
                const mappingRate = session.totalFields > 0 ? Math.round((session.mappedFields / session.totalFields) * 100) : 0;
                return (
                  <Link key={session.id} href={`/sessions/${session.id}`}>
                    <tr className="hover:bg-accent/30 cursor-pointer transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-foreground">{session.erpSystemName}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground">
                          {DOC_TYPE_LABELS[session.documentType] ?? session.documentType}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-foreground">{session.totalFields}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-foreground">{session.mappedFields}</span>
                          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${mappingRate}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{mappingRate}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <ConfidenceBadge value={session.averageConfidence} />
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(session.createdAt)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        <ChevronRight className="w-4 h-4" />
                      </td>
                    </tr>
                  </Link>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
