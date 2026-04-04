"use client";
import { useEffect, useState } from "react";
import { Zap, CheckCircle, XCircle, Clock, PlayCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import Header from "@/components/layout/Header";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

interface Decision {
  id: string;
  type: string;
  priority: "baixa" | "media" | "alta";
  title: string;
  description: string;
  recommended_action: string;
  confidence_score: number;
  status: "pendente" | "aprovado" | "executado" | "ignorado";
  created_at: string;
}

const priorityConfig = {
  alta:  { label: "Alta",  cls: "badge-red"    },
  media: { label: "Média", cls: "badge-yellow"  },
  baixa: { label: "Baixa", cls: "badge-gray"    },
};

const statusConfig = {
  pendente:  { label: "Pendente",  cls: "badge-yellow", icon: Clock },
  aprovado:  { label: "Aprovado",  cls: "badge-blue",   icon: CheckCircle },
  executado: { label: "Executado", cls: "badge-green",  icon: PlayCircle },
  ignorado:  { label: "Ignorado",  cls: "badge-gray",   icon: XCircle },
};

const typeLabel: Record<string, string> = {
  reabastecimento: "Reabastecimento",
  price_adjust:    "Ajuste de preço",
  promocao:        "Promoção",
  alerta:          "Alerta",
  margem:          "Margem crítica",
};

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading]     = useState(true);
  const [generating, setGenerating] = useState(false);
  const [filter, setFilter]       = useState("pendente");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/decisions/?status=${filter === "all" ? "" : filter}&limit=50`);
      setDecisions(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/decisions/${id}/status`, { status });
    load();
  };

  const generate = async () => {
    setGenerating(true);
    try {
      await api.post("/decisions/generate");
      load();
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Header
        title="Decisões"
        subtitle="Recomendações geradas pela IA com base nos seus dados"
        action={
          <button className="btn btn-primary btn-sm" onClick={generate} disabled={generating}>
            {generating ? <Spinner size={14} /> : <><Zap size={14} /> Gerar decisões</>}
          </button>
        }
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { v: "pendente", label: "Pendentes" },
          { v: "aprovado", label: "Aprovados" },
          { v: "executado", label: "Executados" },
          { v: "ignorado", label: "Ignorados" },
          { v: "all", label: "Todos" },
        ].map(({ v, label }) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className="btn btn-sm"
            style={{
              background: filter === v ? "var(--green-dim)" : "transparent",
              color: filter === v ? "var(--green)" : "var(--text2)",
              border: `1px solid ${filter === v ? "rgba(0,211,122,0.3)" : "var(--border)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={24} /></div>
      ) : decisions.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <Zap size={32} color="var(--text3)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text2)", fontSize: 15, marginBottom: 4 }}>Nenhuma decisão encontrada</p>
          <p style={{ color: "var(--text3)", fontSize: 13 }}>Clique em "Gerar decisões" para analisar seus dados</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {decisions.map((d) => {
            const prio = priorityConfig[d.priority] ?? priorityConfig.baixa;
            const stat = statusConfig[d.status] ?? statusConfig.pendente;
            const StatIcon = stat.icon;

            return (
              <div key={d.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                      <span className={`badge ${prio.cls}`}>{prio.label}</span>
                      <span className="badge badge-gray">{typeLabel[d.type] ?? d.type}</span>
                      <span className={`badge ${stat.cls}`} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <StatIcon size={11} />
                        {stat.label}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: "auto" }}>
                        {d.created_at ? formatDate(d.created_at) : ""}
                      </span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>{d.title}</p>
                    <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 8, lineHeight: 1.5 }}>{d.description}</p>
                    <div className="card2" style={{ padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 8 }}>
                      <Zap size={14} color="var(--green)" style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>{d.recommended_action}</p>
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 8 }}>
                      Confiança da IA: {(d.confidence_score * 100).toFixed(0)}%
                    </p>
                  </div>
                  {d.status === "pendente" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => updateStatus(d.id, "aprovado")}>
                        <CheckCircle size={13} /> Aprovar
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(d.id, "ignorado")}>
                        <XCircle size={13} /> Ignorar
                      </button>
                    </div>
                  )}
                  {d.status === "aprovado" && (
                    <button className="btn btn-primary btn-sm" style={{ flexShrink: 0 }} onClick={() => updateStatus(d.id, "executado")}>
                      <PlayCircle size={13} /> Executar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
