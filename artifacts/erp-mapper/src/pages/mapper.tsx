import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useGetErpSystems, useGetCanonicalSchemas, useRunMapping, useExportMapping } from "@workspace/api-client-react";
import type { RunMappingResponse } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle, AlertTriangle, ChevronRight, Download, RefreshCw, X } from "lucide-react";

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
  const labels: Record<string, string> = {
    rule_based: "Rule",
    ai_semantic: "AI",
    fuzzy: "Fuzzy",
    unmapped: "—",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium border ${map[strategy] ?? map.unmapped}`}>
      {labels[strategy] ?? strategy}
    </span>
  );
}

type Step = 1 | 2 | 3;

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

export function Mapper() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [erpSystemId, setErpSystemId] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [jsonText, setJsonText] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<RunMappingResponse | null>(null);
  const [filterReview, setFilterReview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: erpData } = useGetErpSystems();
  const { data: schemasData } = useGetCanonicalSchemas();
  const runMapping = useRunMapping();
  const exportMapping = useExportMapping();

  const handleFileRead = (text: string, name: string) => {
    setFileName(name);
    setJsonText(text);
    setJsonError("");
    try {
      JSON.parse(text);
    } catch {
      setJsonError("Invalid JSON format. Please check the file.");
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleFileRead(ev.target?.result as string, file.name);
    reader.readAsText(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleFileRead(ev.target?.result as string, file.name);
    reader.readAsText(file);
  };

  const canProceedStep1 = erpSystemId && documentType;
  const canProceedStep2 = jsonText && !jsonError;

  const handleRunMapping = async () => {
    if (!canProceedStep2) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setJsonError("Invalid JSON. Cannot proceed.");
      return;
    }
    setStep(3);
    try {
      const res = await runMapping.mutateAsync({ erpSystemId, documentType, erpJson: parsed });
      setResult(res);
    } catch (err) {
      setStep(2);
    }
  };

  const handleExport = async () => {
    if (!result?.sessionId) return;
    const res = await exportMapping.mutateAsync({ sessionId: result.sessionId });
    const a = document.createElement("a");
    a.href = res.downloadUrl;
    a.download = res.filename;
    a.click();
  };

  const mappings = (result?.mappings ?? []) as MappingResultItem[];
  const displayMappings = filterReview ? mappings.filter(m => m.needsReview) : mappings;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground tracking-tight">New Mapping</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Map ERP fields to OpenText BNStandard Canonical XPaths</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {[
          { n: 1, label: "Select ERP & Document" },
          { n: 2, label: "Upload JSON" },
          { n: 3, label: "View Results" },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                step > s.n ? "bg-primary border-primary text-primary-foreground" :
                step === s.n ? "border-primary text-primary bg-primary/10" :
                "border-border text-muted-foreground bg-transparent"
              }`}>
                {step > s.n ? <CheckCircle className="w-4 h-4" /> : s.n}
              </div>
              <span className={`text-sm font-medium ${step === s.n ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-3" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1 */}
        {step === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <label className="block text-sm font-semibold text-foreground mb-3">ERP System</label>
                <div className="space-y-2">
                  {(erpData?.erpSystems ?? []).map(erp => (
                    <button
                      key={erp.id}
                      onClick={() => setErpSystemId(erp.id)}
                      className={`w-full flex items-start gap-3 p-3 rounded-md border text-left transition-colors ${
                        erpSystemId === erp.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent/50 text-foreground"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        erpSystemId === erp.id ? "border-primary" : "border-muted-foreground"
                      }`}>
                        {erpSystemId === erp.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{erp.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{erp.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <label className="block text-sm font-semibold text-foreground mb-3">Document Type</label>
                <div className="space-y-2">
                  {(schemasData?.schemas ?? []).map(schema => (
                    <button
                      key={schema.id}
                      onClick={() => setDocumentType(schema.documentType)}
                      className={`w-full flex items-start gap-3 p-3 rounded-md border text-left transition-colors ${
                        documentType === schema.documentType
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/50 hover:bg-accent/50 text-foreground"
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                        documentType === schema.documentType ? "border-primary" : "border-muted-foreground"
                      }`}>
                        {documentType === schema.documentType && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{schema.name.replace(" Canonical V2.0", "")}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{schema.description}</div>
                        <div className="text-xs text-primary/70 mt-1">Version {schema.version}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">ERP: </span>
                  <span className="text-foreground font-medium">{erpData?.erpSystems.find(e => e.id === erpSystemId)?.name}</span>
                  <span className="mx-2 text-border">|</span>
                  <span className="text-muted-foreground">Type: </span>
                  <span className="text-foreground font-medium">{DOC_TYPE_LABELS[documentType]}</span>
                </div>
                <button onClick={() => setStep(1)} className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                  <X className="w-3 h-3" /> Change
                </button>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-accent/20"
                }`}
              >
                <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileSelect} />
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                {fileName ? (
                  <div>
                    <div className="flex items-center justify-center gap-2 text-primary font-medium">
                      <FileText className="w-4 h-4" />
                      {fileName}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Click to replace or drag a new file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-foreground font-medium">Drop your ERP JSON file here</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Or paste JSON directly</label>
                <textarea
                  value={jsonText}
                  onChange={(e) => {
                    setJsonText(e.target.value);
                    setJsonError("");
                    if (e.target.value) {
                      try { JSON.parse(e.target.value); }
                      catch { setJsonError("Invalid JSON format."); }
                    }
                  }}
                  placeholder='{"No": "SO-001", "Sell_to_Customer_No": "10000", "items": [...]}'
                  className="w-full h-40 font-mono text-xs bg-muted/30 border border-border rounded-md p-3 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                />
                {jsonError && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                    <AlertTriangle className="w-3.5 h-3.5" /> {jsonError}
                  </div>
                )}
                {jsonText && !jsonError && (
                  <div className="flex items-center gap-2 mt-2 text-xs text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Valid JSON
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                Back
              </button>
              <button
                onClick={handleRunMapping}
                disabled={!canProceedStep2}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
              >
                Run Mapping <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Loading + Results */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {runMapping.isPending && (
              <div className="bg-card border border-border rounded-lg p-10 flex flex-col items-center justify-center gap-5">
                <div className="relative w-16 h-16">
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-primary/30"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">AI Mapping in Progress</p>
                  <p className="text-xs text-muted-foreground mt-1">Parsing fields, loading canonical schema, running semantic matching...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">This may take 10-30 seconds</p>
                </div>
              </div>
            )}

            {runMapping.isError && (
              <div className="bg-card border border-red-400/30 rounded-lg p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                <p className="text-sm text-red-400 font-medium">Mapping failed</p>
                <p className="text-xs text-muted-foreground mt-1">{String(runMapping.error)}</p>
                <button onClick={() => setStep(2)} className="mt-3 text-xs text-primary hover:underline">Try again</button>
              </div>
            )}

            {result && !runMapping.isPending && (
              <>
                {/* Stats bar */}
                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex flex-wrap items-center gap-6">
                    <div>
                      <div className="text-2xl font-bold font-mono text-foreground">{result.stats.mappedFields}</div>
                      <div className="text-xs text-muted-foreground">Fields Mapped</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-muted-foreground">{result.stats.unmappedFields}</div>
                      <div className="text-xs text-muted-foreground">Unmapped</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-emerald-400">{result.stats.highConfidence}</div>
                      <div className="text-xs text-muted-foreground">High Confidence</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-amber-400">{result.stats.mediumConfidence}</div>
                      <div className="text-xs text-muted-foreground">Medium Confidence</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-red-400">{result.stats.needsReview}</div>
                      <div className="text-xs text-muted-foreground">Needs Review</div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                      <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input type="checkbox" checked={filterReview} onChange={e => setFilterReview(e.target.checked)} className="accent-primary" />
                        Show review only
                      </label>
                      <button
                        onClick={handleExport}
                        disabled={exportMapping.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                      >
                        <Download className="w-4 h-4" />
                        {exportMapping.isPending ? "Exporting..." : "Export CSV"}
                      </button>
                      <button
                        onClick={() => { setStep(1); setResult(null); setJsonText(""); setFileName(""); runMapping.reset(); }}
                        className="flex items-center gap-2 px-3 py-2 border border-border rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        New
                      </button>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider w-8">#</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">ERP Field</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Level</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Dialect Term</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Canonical XPath</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider">Strategy</th>
                          <th className="px-4 py-3 text-left font-semibold text-muted-foreground uppercase tracking-wider w-16">Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {displayMappings.map((m, i) => (
                          <tr
                            key={i}
                            className={`transition-colors hover:bg-accent/30 ${m.needsReview ? "bg-amber-400/5 border-l-2 border-l-amber-400" : ""}`}
                            title={m.rationale}
                          >
                            <td className="px-4 py-2.5 text-muted-foreground font-mono">{i + 1}</td>
                            <td className="px-4 py-2.5">
                              <span className="font-mono text-foreground">{m.erpFieldKey || "—"}</span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`px-1.5 py-0.5 rounded text-xs ${m.erpJsonPath.includes("|items|") ? "bg-violet-400/10 text-violet-400" : "bg-blue-400/10 text-blue-400"}`}>
                                {m.erpJsonPath.includes("|items|") ? "line" : "header"}
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-foreground">{m.dialectTerm || "—"}</td>
                            <td className="px-4 py-2.5 max-w-xs">
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
                              {m.needsReview && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mx-auto" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {displayMappings.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">No mappings to display</div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
