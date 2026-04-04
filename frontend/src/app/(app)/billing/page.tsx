"use client";
import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, Zap } from "lucide-react";
import api from "@/lib/api";
import Header from "@/components/layout/Header";
import Spinner from "@/components/ui/Spinner";

interface Plan {
  plan: string;
  name: string;
  price_brl: number;
  limits: { integrations: number; products: number };
  usage: { integrations: number; products: number };
}

interface Usage {
  period: string;
  orders_processed: number;
  active_integrations: number;
  monitored_products: number;
}

const ALL_PLANS = [
  { id: "starter", name: "Starter", price: 197, integrations: 1,  products: 100,   desc: "Para quem está começando" },
  { id: "pro",     name: "Pro",     price: 497, integrations: 3,  products: 1000,  desc: "Para lojas em crescimento" },
  { id: "scale",   name: "Scale",   price: 997, integrations: 10, products: 99999, desc: "Para grandes operações" },
];

export default function BillingPage() {
  const [plan, setPlan]   = useState<Plan | null>(null);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/billing/plan"), api.get("/billing/usage")])
      .then(([p, u]) => { setPlan(p.data); setUsage(u.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spinner size={28} /></div>
    );
  }

  const pct = (used: number, limit: number) => Math.min(100, limit === 99999 ? 0 : (used / limit) * 100);

  return (
    <>
      <Header title="Plano" subtitle="Gerencie sua assinatura Orka" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Current plan */}
          {plan && (
            <div className="card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <CreditCard size={16} color="var(--green)" />
                    <p style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>PLANO ATUAL</p>
                  </div>
                  <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{plan.name}</p>
                  <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>R$ {plan.price_brl}/mês</p>
                </div>
                <span className="badge badge-green">Ativo</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Integrações", used: plan.usage.integrations, limit: plan.limits.integrations },
                  { label: "Produtos",    used: plan.usage.products,    limit: plan.limits.products === 99999 ? Infinity : plan.limits.products },
                ].map(({ label, used, limit }) => {
                  const p = isFinite(limit) ? pct(used, limit) : 0;
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
                        <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                          {used} / {isFinite(limit) ? limit : "∞"}
                        </span>
                      </div>
                      <div style={{ height: 4, background: "var(--border)", borderRadius: 99 }}>
                        <div style={{ width: `${p}%`, height: "100%", background: p > 85 ? "var(--red)" : "var(--green)", borderRadius: 99, transition: "width 0.6s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Plans */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {ALL_PLANS.map((p) => {
              const isCurrent = plan?.plan === p.id;
              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    padding: 20,
                    borderColor: isCurrent ? "rgba(0,211,122,0.4)" : "var(--border)",
                    position: "relative",
                  }}
                >
                  {isCurrent && (
                    <div style={{ position: "absolute", top: -1, right: 16, transform: "translateY(-50%)" }}>
                      <span className="badge badge-green" style={{ fontSize: 11 }}>Atual</span>
                    </div>
                  )}
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{p.name}</p>
                  <p style={{ fontSize: 13, color: "var(--text3)", marginBottom: 12 }}>{p.desc}</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "var(--green)", marginBottom: 14 }}>
                    R$ {p.price}<span style={{ fontSize: 13, fontWeight: 400, color: "var(--text2)" }}>/mês</span>
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {[
                      `${p.integrations} integração${p.integrations > 1 ? "ões" : ""}`,
                      `${p.products === 99999 ? "Produtos ilimitados" : `${p.products} produtos`}`,
                      "Dashboard completo",
                      "IA preditiva",
                    ].map(feat => (
                      <div key={feat} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <CheckCircle size={13} color="var(--green)" />
                        <span style={{ fontSize: 12, color: "var(--text2)" }}>{feat}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className={`btn btn-sm ${isCurrent ? "btn-ghost" : "btn-primary"}`}
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled={isCurrent}
                  >
                    {isCurrent ? "Plano atual" : "Fazer upgrade"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Usage */}
        {usage && (
          <div className="card" style={{ padding: 24, alignSelf: "start" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>Uso — {usage.period}</p>
            <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>Resumo de consumo da plataforma</p>
            {[
              { label: "Pedidos processados",  value: usage.orders_processed },
              { label: "Integrações ativas",   value: usage.active_integrations },
              { label: "Produtos monitorados", value: usage.monitored_products },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{value.toLocaleString("pt-BR")}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
