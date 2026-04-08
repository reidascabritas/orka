"use client";
import { useEffect, useState } from "react";
import { RefreshCw, CheckCircle, Plus, ExternalLink, Waves } from "lucide-react";
import api from "@/lib/api";
import Header from "@/components/layout/Header";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

interface Integration {
  id: string;
  platform: string;
  expires_at: string | null;
  created_at: string | null;
}

interface SyncStatus {
  [id: string]: "idle" | "syncing" | "done" | "error";
}

const platformConfig: Record<string, { label: string; bg: string; text: string; logo: string; desc: string }> = {
  mercado_livre: {
    label: "Mercado Livre",
    bg: "#FFE600",
    text: "#1A1A00",
    logo: "ML",
    desc: "Sincronize pedidos, produtos e estoque automaticamente",
  },
  amazon: {
    label: "Amazon",
    bg: "#FF9900",
    text: "#fff",
    logo: "AZ",
    desc: "Integração com Amazon Seller Central via SP-API",
  },
  shopify: {
    label: "Shopify",
    bg: "#96BF48",
    text: "#fff",
    logo: "SH",
    desc: "Sincronize sua loja Shopify em tempo real",
  },
};

const AVAILABLE = [
  { key: "mercado_livre", label: "Mercado Livre", desc: "Sincronize pedidos, produtos e estoque automaticamente" },
  { key: "amazon",        label: "Amazon",         desc: "Integração com Amazon Seller Central via SP-API" },
  { key: "shopify",       label: "Shopify",        desc: "Sincronize sua loja Shopify em tempo real" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading]           = useState(true);
  const [syncAllLoading, setSyncAllLoading] = useState(false);
  const [syncStatus, setSyncStatus]     = useState<SyncStatus>({});
  const [connecting, setConnecting]     = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/integrations/");
      setIntegrations(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const syncAll = async () => {
    setSyncAllLoading(true);
    try {
      await api.post("/integrations/sync-all");
      await load();
    } finally {
      setSyncAllLoading(false);
    }
  };

  const syncOne = async (id: string) => {
    setSyncStatus(s => ({ ...s, [id]: "syncing" }));
    try {
      await api.post(`/integrations/${id}/sync`);
      setSyncStatus(s => ({ ...s, [id]: "done" }));
      await load();
      setTimeout(() => setSyncStatus(s => ({ ...s, [id]: "idle" })), 2000);
    } catch {
      setSyncStatus(s => ({ ...s, [id]: "error" }));
      setTimeout(() => setSyncStatus(s => ({ ...s, [id]: "idle" })), 3000);
    }
  };

  const connect = async (platform: string) => {
    setConnecting(platform);
    try {
      if (platform === "mercado_livre") {
        const { data } = await api.get("/integrations/mercadolivre/connect");
        window.open(data.redirect_url, "_blank");
      } else {
        alert("Configure as credenciais no arquivo .env para conectar essa plataforma.");
      }
    } finally {
      setConnecting(null);
    }
  };

  const connectedKeys = new Set(integrations.map(i => i.platform));

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
        <Spinner size={28} />
      </div>
    );
  }

  return (
    <>
      <Header
        title="Integrações"
        subtitle="Conecte seus marketplaces e lojas"
        action={
          integrations.length > 0 ? (
            <button className="btn btn-ghost btn-sm" onClick={syncAll} disabled={syncAllLoading}>
              {syncAllLoading
                ? <><Spinner size={14} /> Sincronizando...</>
                : <><RefreshCw size={14} /> Sincronizar tudo</>}
            </button>
          ) : undefined
        }
      />

      {/* Banner Mercado Livre destaque */}
      {!connectedKeys.has("mercado_livre") && (
        <div style={{
          marginBottom: 24,
          padding: "18px 22px",
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(29,78,216,0.06), rgba(14,165,233,0.06))",
          border: "1px solid rgba(14,165,233,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: "#FFE600",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 800, color: "#1A1A00",
              flexShrink: 0,
            }}>
              ML
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>
                Conecte o Mercado Livre agora
              </p>
              <p style={{ fontSize: 12, color: "var(--text2)" }}>
                Sincronize pedidos e produtos automaticamente com OAuth seguro
              </p>
            </div>
          </div>
          <button
            onClick={() => connect("mercado_livre")}
            disabled={connecting === "mercado_livre"}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "9px 18px", borderRadius: 8, border: "none",
              background: "linear-gradient(135deg, #1D4ED8, #0EA5E9)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              boxShadow: "0 2px 10px rgba(14,165,233,0.3)",
              flexShrink: 0,
            }}
          >
            {connecting === "mercado_livre"
              ? <Spinner size={14} />
              : <><ExternalLink size={13} /> Conectar Mercado Livre</>}
          </button>
        </div>
      )}

      {/* Conectadas */}
      {integrations.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
            Conectadas ({integrations.length})
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
            {integrations.map((i) => {
              const cfg = platformConfig[i.platform];
              const st  = syncStatus[i.id] ?? "idle";
              return (
                <div key={i.id} className="card" style={{ padding: 20, borderTop: "3px solid #1D4ED8" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: cfg?.bg ?? "var(--surface2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: cfg?.text ?? "var(--text)",
                      flexShrink: 0,
                    }}>
                      {cfg?.logo ?? i.platform[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>
                        {cfg?.label ?? i.platform}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <CheckCircle size={11} color="#14B8A6" />
                        <span style={{ fontSize: 12, color: "#14B8A6", fontWeight: 500 }}>Conectado</span>
                      </div>
                    </div>
                    {st === "done" && (
                      <span className="badge badge-teal" style={{ fontSize: 10 }}>Synced!</span>
                    )}
                    {st === "error" && (
                      <span className="badge badge-red" style={{ fontSize: 10 }}>Erro</span>
                    )}
                  </div>

                  {cfg?.desc && (
                    <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14, lineHeight: 1.5 }}>
                      {cfg.desc}
                    </p>
                  )}

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--text3)" }}>
                      {i.created_at ? `Desde ${formatDate(i.created_at)}` : "Recentemente conectado"}
                    </span>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => syncOne(i.id)}
                      disabled={st === "syncing"}
                      style={{ gap: 5 }}
                    >
                      {st === "syncing"
                        ? <><Spinner size={12} /> Sync...</>
                        : <><RefreshCw size={12} /> Sync</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disponíveis */}
      {AVAILABLE.some(a => !connectedKeys.has(a.key)) && (
        <div>
          <p style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
            Disponíveis para conectar
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 12 }}>
            {AVAILABLE.filter(a => !connectedKeys.has(a.key)).map((a) => {
              const cfg = platformConfig[a.key];
              const isConnecting = connecting === a.key;
              return (
                <div key={a.key} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: cfg?.bg ?? "var(--surface2)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 800, color: cfg?.text ?? "var(--text)",
                      flexShrink: 0,
                    }}>
                      {cfg?.logo ?? a.key[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>{a.label}</p>
                      <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, lineHeight: 1.4 }}>{a.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => connect(a.key)}
                    disabled={isConnecting}
                    className="btn btn-ghost btn-sm"
                    style={{ width: "100%", justifyContent: "center", gap: 6 }}
                  >
                    {isConnecting
                      ? <><Spinner size={13} /> Conectando...</>
                      : <><Plus size={13} /> Conectar {a.label}</>}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tudo conectado */}
      {AVAILABLE.every(a => connectedKeys.has(a.key)) && (
        <div className="card" style={{ padding: 24, display: "flex", alignItems: "center", gap: 12, borderTop: "3px solid #14B8A6" }}>
          <Waves size={20} color="#14B8A6" />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Tudo conectado!</p>
            <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
              Todas as plataformas disponíveis estão sincronizando.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
