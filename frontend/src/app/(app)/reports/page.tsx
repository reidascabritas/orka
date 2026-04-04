"use client";
import { useEffect, useState } from "react";
import { FileText, Plus, TrendingUp, AlertTriangle, Lightbulb, ClipboardList } from "lucide-react";
import api from "@/lib/api";
import Header from "@/components/layout/Header";
import Spinner from "@/components/ui/Spinner";
import { formatBRL, formatDate } from "@/lib/utils";

interface Report {
  id: string;
  type: string;
  summary: string;
  generated_at: string;
}

interface ReportDetail extends Report {
  sections: { resumo: string; problemas: string; oportunidades: string; plano: string };
  metrics: { revenue: number; revenue_growth_pct: number; orders: number; pending_decisions: number };
}

const sectionConfig = [
  { key: "resumo",         label: "Resumo",         icon: TrendingUp,     color: "var(--blue)"   },
  { key: "problemas",      label: "Problemas",       icon: AlertTriangle,  color: "var(--red)"    },
  { key: "oportunidades",  label: "Oportunidades",   icon: Lightbulb,      color: "var(--yellow)" },
  { key: "plano",          label: "Plano de ação",   icon: ClipboardList,  color: "var(--green)"  },
];

export default function ReportsPage() {
  const [reports, setReports]     = useState<Report[]>([]);
  const [selected, setSelected]   = useState<ReportDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/reports/");
      setReports(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generate = async (type: string) => {
    setGenerating(true);
    try {
      const { data } = await api.post("/reports/generate", { type });
      setReports(prev => [data, ...prev]);
      selectReport(data.id);
    } finally {
      setGenerating(false);
    }
  };

  const selectReport = async (id: string) => {
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/reports/${id}`);
      setSelected(data);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <>
      <Header
        title="Relatórios"
        subtitle="Análises automáticas do seu negócio"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => generate("semanal")} disabled={generating}>
              {generating ? <Spinner size={14} /> : <><Plus size={14} /> Semanal</>}
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => generate("mensal")} disabled={generating}>
              {generating ? <Spinner size={14} /> : <><Plus size={14} /> Mensal</>}
            </button>
          </div>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>
        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}><Spinner size={20} /></div>
          ) : reports.length === 0 ? (
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <FileText size={24} color="var(--text3)" style={{ margin: "0 auto 8px" }} />
              <p style={{ fontSize: 13, color: "var(--text3)" }}>Nenhum relatório ainda</p>
            </div>
          ) : reports.map((r) => (
            <div
              key={r.id}
              className="card"
              style={{
                padding: 16,
                cursor: "pointer",
                background: selected?.id === r.id ? "var(--surface2)" : "var(--surface)",
                borderColor: selected?.id === r.id ? "rgba(0,211,122,0.3)" : "var(--border)",
                transition: "all 0.15s",
              }}
              onClick={() => selectReport(r.id)}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className={`badge ${r.type === "mensal" ? "badge-blue" : "badge-green"}`}>
                  {r.type === "mensal" ? "Mensal" : "Semanal"}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 4 }}>
                {r.generated_at ? formatDate(r.generated_at) : ""}
              </p>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div>
          {loadingDetail ? (
            <div className="card" style={{ padding: 60, display: "flex", justifyContent: "center" }}>
              <Spinner size={24} />
            </div>
          ) : !selected ? (
            <div className="card" style={{ padding: 60, textAlign: "center" }}>
              <FileText size={32} color="var(--text3)" style={{ margin: "0 auto 12px" }} />
              <p style={{ color: "var(--text2)", fontSize: 15 }}>Selecione um relatório</p>
              <p style={{ color: "var(--text3)", fontSize: 13, marginTop: 4 }}>ou gere um novo acima</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Metrics */}
              {selected.metrics && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                  {[
                    { label: "Receita",       value: formatBRL(selected.metrics.revenue) },
                    { label: "Crescimento",   value: `${selected.metrics.revenue_growth_pct > 0 ? "+" : ""}${selected.metrics.revenue_growth_pct.toFixed(1)}%` },
                    { label: "Pedidos",       value: String(selected.metrics.orders) },
                    { label: "Dec. pendentes", value: String(selected.metrics.pending_decisions) },
                  ].map(m => (
                    <div key={m.label} className="card" style={{ padding: 14 }}>
                      <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 4 }}>{m.label}</p>
                      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{m.value}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Sections */}
              {selected.sections && sectionConfig.map(({ key, label, icon: Icon, color }) => {
                const content = selected.sections[key as keyof typeof selected.sections];
                if (!content) return null;
                return (
                  <div key={key} className="card" style={{ padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon size={14} color={color} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{label}</p>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.7, whiteSpace: "pre-line" }}>{content}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
