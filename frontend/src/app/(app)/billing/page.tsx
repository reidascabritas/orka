"use client";
import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, Zap, Loader2, ShieldCheck, Waves } from "lucide-react";
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
  {
    id: "starter",
    name: "Starter",
    price: 197,
    integrations: 1,
    products: 100,
    desc: "Para quem está começando",
    highlight: false,
    features: ["1 integração", "100 produtos", "Dashboard completo", "IA preditiva"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 497,
    integrations: 3,
    products: 1000,
    desc: "Para lojas em crescimento",
    highlight: true,
    features: ["3 integrações", "1.000 produtos", "Dashboard completo", "IA preditiva", "Alertas em tempo real"],
  },
  {
    id: "scale",
    name: "Scale",
    price: 997,
    integrations: 10,
    products: 99999,
    desc: "Para grandes operações",
    highlight: false,
    features: ["10 integrações", "Produtos ilimitados", "Dashboard completo", "IA preditiva", "Alertas em tempo real", "Suporte prioritário"],
  },
];

export default function BillingPage() {
  const [plan, setPlan]       = useState<Plan | null>(null);
  const [usage, setUsage]     = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError]     = useState("");

  useEffect(() => {
    Promise.all([api.get("/billing/plan"), api.get("/billing/usage")])
      .then(([p, u]) => { setPlan(p.data); setUsage(u.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
        <Spinner size={28} />
      </div>
    );
  }

  const pct = (used: number, limit: number) =>
    Math.min(100, limit === 99999 ? 0 : (used / limit) * 100);

  const handleUpgrade = async (planId: string) => {
    setCheckoutLoading(planId);
    setCheckoutError("");
    try {
      const { data } = await api.post("/billing/abacatepay/checkout", { plan: planId });
      if (data.checkout_url) {
        window.open(data.checkout_url, "_blank");
      }
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setCheckoutError(e?.response?.data?.detail || "Erro ao iniciar pagamento. Tente novamente.");
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <>
      <Header title="Plano & Cobrança" subtitle="Gerencie sua assinatura Orka via Abacate Pay" />

      {checkoutError && (
        <div style={{
          marginBottom: 20,
          background: "var(--red-dim)",
          border: "1px solid rgba(239,68,68,0.25)",
          borderRadius: 10,
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--red)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          {checkoutError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Plano atual */}
          {plan && (
            <div className="card" style={{ padding: 24, borderTop: "3px solid var(--green)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <CreditCard size={15} color="var(--green)" />
                    <p style={{ fontSize: 11, color: "var(--text2)", fontWeight: 700, letterSpacing: "0.8px", textTransform: "uppercase" }}>Plano Atual</p>
                  </div>
                  <p style={{ fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{plan.name}</p>
                  <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>
                    R$ {plan.price_brl}<span style={{ fontSize: 11 }}>/mês</span>
                  </p>
                </div>
                <span className="badge badge-green">
                  <span className="pulse-dot" style={{ width: 5, height: 5, background: "var(--green)", animation: "none" }} />
                  Ativo
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { label: "Integrações", used: plan.usage.integrations, limit: plan.limits.integrations },
                  { label: "Produtos",    used: plan.usage.products, limit: plan.limits.products === 99999 ? Infinity : plan.limits.products },
                ].map(({ label, used, limit }) => {
                  const p = isFinite(limit) ? pct(used, limit) : 0;
                  const isHigh = p > 80;
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: isHigh ? "var(--red)" : "var(--text)" }}>
                          {used} / {isFinite(limit) ? limit : "∞"}
                        </span>
                      </div>
                      <div style={{ height: 5, background: "var(--border)", borderRadius: 99 }}>
                        <div style={{
                          width: `${p}%`,
                          height: "100%",
                          background: isHigh
                            ? "var(--red)"
                            : "linear-gradient(90deg, #1D4ED8, #0EA5E9)",
                          borderRadius: 99,
                          transition: "width 0.6s",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Planos disponíveis */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {ALL_PLANS.map((p) => {
              const isCurrent = plan?.plan === p.id;
              const isLoading = checkoutLoading === p.id;

              return (
                <div
                  key={p.id}
                  className="card"
                  style={{
                    padding: 22,
                    borderColor: p.highlight ? "rgba(14,165,233,0.4)" : "var(--border)",
                    borderTop: p.highlight ? "3px solid #0EA5E9" : isCurrent ? "3px solid var(--green)" : "3px solid var(--border)",
                    position: "relative",
                  }}
                >
                  {p.highlight && (
                    <div style={{
                      position: "absolute",
                      top: -1,
                      right: 16,
                      transform: "translateY(-50%)",
                    }}>
                      <span className="badge badge-blue" style={{ fontSize: 10, fontWeight: 700 }}>
                        Mais popular
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div style={{ position: "absolute", top: -1, right: 16, transform: "translateY(-50%)" }}>
                      <span className="badge badge-green" style={{ fontSize: 10 }}>Atual</span>
                    </div>
                  )}

                  <p style={{ fontSize: 16, fontWeight: 800, color: "var(--text)", marginBottom: 2 }}>{p.name}</p>
                  <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 14 }}>{p.desc}</p>
                  <p style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: p.highlight ? "#0EA5E9" : "var(--text)" }}>
                      R$ {p.price}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 400, color: "var(--text2)" }}>/mês</span>
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 18 }}>
                    {p.features.map(feat => (
                      <div key={feat} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <CheckCircle size={13} color={p.highlight ? "#0EA5E9" : "var(--green)"} />
                        <span style={{ fontSize: 12, color: "var(--text2)" }}>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => !isCurrent && handleUpgrade(p.id)}
                    disabled={isCurrent || isLoading}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      padding: "10px 0",
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 600,
                      border: "none",
                      cursor: isCurrent ? "default" : "pointer",
                      fontFamily: "inherit",
                      opacity: isCurrent ? 0.6 : 1,
                      background: isCurrent
                        ? "var(--surface2)"
                        : p.highlight
                          ? "linear-gradient(135deg, #1D4ED8, #0EA5E9)"
                          : "var(--green)",
                      color: isCurrent ? "var(--text2)" : "#fff",
                      transition: "all 0.15s",
                      boxShadow: (!isCurrent && p.highlight)
                        ? "0 2px 12px rgba(14,165,233,0.35)"
                        : "none",
                    }}
                  >
                    {isLoading ? (
                      <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Aguarde...</>
                    ) : isCurrent ? (
                      "Plano atual"
                    ) : (
                      <><Zap size={13} /> Assinar via Abacate Pay</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Aviso de segurança */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 16px",
            background: "rgba(29,78,216,0.05)",
            border: "1px solid rgba(29,78,216,0.15)",
            borderRadius: 10,
          }}>
            <ShieldCheck size={16} color="var(--green)" />
            <p style={{ fontSize: 12, color: "var(--text2)" }}>
              Pagamentos processados com segurança via <strong style={{ color: "var(--text)" }}>Abacate Pay</strong> —
              PIX, cartão de crédito e boleto disponíveis.
            </p>
          </div>
        </div>

        {/* Uso */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {usage && (
            <div className="card" style={{ padding: 24, alignSelf: "start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Waves size={15} color="var(--blue)" />
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Uso da plataforma</p>
              </div>
              <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>{usage.period}</p>
              {[
                { label: "Pedidos processados",  value: usage.orders_processed,   color: "#1D4ED8" },
                { label: "Integrações ativas",   value: usage.active_integrations, color: "#0EA5E9" },
                { label: "Produtos monitorados", value: usage.monitored_products,  color: "#6366F1" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                  alignItems: "center",
                }}>
                  <span style={{ fontSize: 13, color: "var(--text2)" }}>{label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color }}>{value.toLocaleString("pt-BR")}</span>
                </div>
              ))}
            </div>
          )}

          {/* Info Abacate Pay */}
          <div className="card" style={{ padding: 20 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              Sobre o Abacate Pay
            </p>
            <p style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.6, marginBottom: 12 }}>
              Processamos pagamentos com segurança via Abacate Pay, plataforma brasileira de pagamentos com foco em agilidade e confiabilidade.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["PIX instantâneo", "Cartão de crédito", "Boleto bancário"].map(m => (
                <div key={m} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle size={12} color="#0EA5E9" />
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{m}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
