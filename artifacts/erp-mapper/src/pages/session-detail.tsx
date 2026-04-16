import { useRoute, useLocation } from "wouter";
import { useGetMappingSession, useExportMapping } from "@workspace/api-client-react";
import { Download, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react";

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

function StrategyBadge({ strategy }: { strategy: string }) {
  const map: Record<string, string> = {
    rule_based: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    ai_semantic: "bg-violet-400/10 text-violet-400 border-violet-400/20",
    fuzzy: "bg-orange-400/10 text-orange-400 border-orange-400/20",
    unmapped: "bg-muted text-muted-foreground border-border",
  };
  const labels: Record<string, string> = { rule_based: "Rule", ai_semantic: "AI", fuzzy: "Fuzzy", unmapped: "—" };
  return <span className={`px-2 py-0.5 rounded text-xs font-medium border ${map[strategy] ?? map.unmapped}`}>{labels[strategy] ?? strategy}</span>;
}

interface MappingResultItem {
  canonicalXpath: string;
  dialectTerm: string;
  erpJsonPath: string;
  erpFieldKey: string;
  confidence: number;
  matchStrategy: string;
  rationale: string;
  smrConstruct: string;
  compositeRef: string;
  needsReview: boolean;
}

interface Stats {
  totalErpFields: number;
  totalCanonicalFields: number;
  mappedFields: number;
  unmappedFields: number;
  highConfidence: number;
  mediumConfidence: number;
  lowConfidence: number;
  needsReview: number;
  averageConfidence: number;
}

export function SessionDetail() {
  const [, params] = useRoute("/sessions/:id");
  const [, navigate] = useLocation();
  const id = params?.id ?? "";

  const { data: session, isLoading, isError } = useGetMappingSession(id, {
    query: { enabled: !!id }
  });
  const exportMapping = useExportMapping();

  const handleExport = async () => {
    if (!session?.id) return;
    const res = await exportMapping.mutateAsync({ sessionId: session.id });
    const a = document.createElement("a");
    a.href = res.downloadUrl;
    a.download = res.filename;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">Loading session...</div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="p-6">
        <div className="bg-card border border-red-400/30 rounded-lg p-8 text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-red-400">Session not found</p>
          <button onClick={() => navigate("/sessions")} className="mt-3 text-xs text-primary hover:underline">Back to Sessions</button>
        </div>
      </div>
    );
  }

  const mappings = (session.mappings ?? []) as MappingResultItem[];
  const stats = session.stats as unknown as Stats;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/sessions")} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Sessions
        </button>
        <div className="h-4 w-px bg-border" />
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">{session.erpSystemName}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {DOC_TYPE_LABELS[session.documentType] ?? session.documentType}
            </span>
            <span className="text-xs text-muted-foreground">Session #{session.id}</span>
            <span className="text-xs text-muted-foreground">{new Date(session.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exportMapping.isPending}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {exportMapping.isPending ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total ERP Fields", value: stats?.totalErpFields, color: "text-foreground" },
          { label: "Mapped", value: stats?.mappedFields, color: "text-primary" },
          { label: "High Confidence", value: stats?.highConfidence, color: "text-emerald-400" },
          { label: "Needs Review", value: stats?.needsReview, color: "text-amber-400" },
          { label: "Avg Confidence", value: `${Math.round((stats?.averageConfidence ?? 0) * 100)}%`, color: "text-foreground" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-lg p-4">
            <div className={`text-xl font-bold font-mono ${s.color}`}>{s.value ?? 0}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Results Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Mapping Results</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Hover a row to see the AI rationale</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">ERP Field</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Dialect Term</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Canonical XPath</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Strategy</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground uppercase tracking-wider">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mappings.map((m, i) => (
                <tr
                  key={i}
                  title={m.rationale}
                  className={`transition-colors hover:bg-accent/30 ${m.needsReview ? "bg-amber-400/5 border-l-2 border-l-amber-400" : ""}`}
                >
                  <td className="px-4 py-2.5 text-muted-foreground font-mono">{i + 1}</td>
                  <td className="px-4 py-2.5 font-mono text-foreground">{m.erpFieldKey || "—"}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${m.erpJsonPath.includes("|items|") ? "bg-violet-400/10 text-violet-400" : "bg-blue-400/10 text-blue-400"}`}>
                      {m.erpJsonPath.includes("|items|") ? "line" : "header"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-foreground">{m.dialectTerm || "—"}</td>
                  <td className="px-4 py-2.5 max-w-sm">
                    <span className="font-mono text-xs text-primary/80 block truncate" title={m.canonicalXpath}>
                      {m.canonicalXpath || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {m.confidence > 0 ? <ConfidenceBadge value={m.confidence} /> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <StrategyBadge strategy={m.matchStrategy} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {m.needsReview ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                    ) : m.canonicalXpath ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400/50 mx-auto" />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {mappings.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No mapping data available</div>
        )}
      </div>
    </div>
  );
}
