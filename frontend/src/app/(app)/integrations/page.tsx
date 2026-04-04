"use client";
import { useEffect, useState } from "react";
import { Plug, RefreshCw, CheckCircle, AlertCircle, Plus } from "lucide-react";
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

const platformConfig: Record<string, { label: string; color: string; logo: string }> = {
  mercado_livre: { label: "Mercado Livre",  color: "#FFE600", logo: "ML" },
  amazon:        { label: "Amazon",          color: "#FF9900", logo: "AZ" },
  shopify:       { label: "Shopify",         color: "#96BF48", logo: "SH" },
};

const AVAILABLE = [
  { key: "mercado_livre", label: "Mercado Livre", desc: "Sincronize pedidos e produtos automaticamente" },
  { key: "amazon",        label: "Amazon",         desc: "Integração com Amazon Seller Central (SP-API)" },
  { key: "shopify",       label: "Shopify",        desc: "Sincronize sua loja Shopify em tempo real" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading]           = useState(true);
  const [syncing, setSyncing]           = useState(false);

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
    setSyncing(true);
    try { await api.post("/integrations/sync-all"); load(); }
    finally { setSyncing(false); }
  };

  const connect = async (platform: string) => {
    if (platform === "mercado_livre") {
      const { data } = await api.get("/integrations/mercadolivre/connect");
      window.open(data.redirect_url, "_blank");
    } else {
      alert("Configure as credenciais no arquivo .env para conectar essa plataforma.");
    }
  };

  const connectedKeys = new Set(integrations.map(i => i.platform));

  return (
    <>
      <Header
        title="Integrações"
        subtitle="Conecte seus marketplaces e lojas"
        action={
          integrations.length > 0 ? (
            <button className="btn btn-ghost btn-sm" onClick={syncAll} disabled={syncing}>
              {syncing ? <Spinner size={14} /> : <><RefreshCw size={14} /> Sincronizar tudo</>}
            </button>
          ) : undefined
        }
      />

      {/* Connected */}
      {integrations.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, marginBottom: 12 }}>CONECTADAS</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            {integrations.map((i) => {
              const cfg = platformConfig[i.platform];
              return (
                <div key={i.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg?.color ?? "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#000" }}>
                      {cfg?.logo ?? i.platform[0].toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{cfg?.label ?? i.platform}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <CheckCircle size={11} color="var(--green)" />
                        <span style={{ fontSize: 12, color: "var(--green)" }}>Conectado</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--text3)" }}>
                      {i.created_at ? `Desde ${formatDate(i.created_at)}` : ""}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => api.post(`/integrations/mercadolivre/${i.id}/sync`).then(load)}>
                      <RefreshCw size={12} /> Sync
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available */}
      <div>
        <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500, marginBottom: 12 }}>DISPONÍVEIS</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
          {AVAILABLE.filter(a => !connectedKeys.has(a.key)).map((a) => {
            const cfg = platformConfig[a.key];
            return (
              <div key={a.key} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg?.color ?? "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#000" }}>
                    {cfg?.logo ?? a.key[0].toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{a.label}</p>
                    <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{a.desc}</p>
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={() => connect(a.key)}>
                  <Plus size={13} /> Conectar
                </button>
              </div>
            );
          })}
          {AVAILABLE.every(a => connectedKeys.has(a.key)) && (
            <div className="card" style={{ padding: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <CheckCircle size={18} color="var(--green)" />
              <p style={{ fontSize: 14, color: "var(--text2)" }}>Todas as plataformas conectadas!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
