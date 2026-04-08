"use client";
import { useState } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 0,
    desc: "Grátis por 14 dias",
    features: [
      "Até 2 integrações",
      "Dashboard básico",
      "Insights automáticos",
      "Relatórios semanais",
      "Suporte via chat",
    ],
    highlight: false,
    cta: "Começar grátis",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 197,
    annualPrice: 158,
    desc: "O mais popular entre lojistas",
    features: [
      "Integrações ilimitadas",
      "IA avançada + ML preditivo",
      "Decisões automáticas",
      "Relatórios mensais",
      "Detecção de anomalias",
      "Suporte prioritário",
    ],
    highlight: true,
    cta: "Assinar agora",
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" style={{
      padding: "110px 48px",
      background: "var(--lp-s1)",
      borderTop: "1px solid var(--lp-border)",
      borderBottom: "1px solid var(--lp-border)",
    }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--lp-cyan)", marginBottom: 14 }}>
            Pricing
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 800, letterSpacing: "-1px", color: "var(--lp-text)", marginBottom: 16,
          }}>
            Simples. Transparente.<br />
            <span className="lp-grad-text">Sem surpresas.</span>
          </h2>

          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.05)", border: "1px solid var(--lp-border)", borderRadius: 99, padding: "6px 16px", marginTop: 8 }}>
            <button onClick={() => setAnnual(false)} style={{
              fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
              background: !annual ? "rgba(14,165,233,0.2)" : "transparent",
              color: !annual ? "#fff" : "var(--lp-muted)",
              borderRadius: 99, padding: "4px 14px", transition: "all 0.2s", fontFamily: "inherit",
            }}>
              Mensal
            </button>
            <button onClick={() => setAnnual(true)} style={{
              fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
              background: annual ? "rgba(14,165,233,0.2)" : "transparent",
              color: annual ? "#fff" : "var(--lp-muted)",
              borderRadius: 99, padding: "4px 14px", transition: "all 0.2s", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              Anual
              <span style={{ fontSize: 10, background: "rgba(34,197,94,0.15)", color: "#14B8A6", borderRadius: 99, padding: "1px 6px", fontWeight: 600 }}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {PLANS.map((p) => {
            const price = annual && p.annualPrice ? p.annualPrice : p.monthlyPrice;
            return (
              <div
                key={p.id}
                style={{
                  position: "relative",
                  background: p.highlight
                    ? "linear-gradient(var(--lp-s2), var(--lp-s2)) padding-box, linear-gradient(135deg, rgba(29,78,216,0.7), rgba(14,165,233,0.5)) border-box"
                    : "var(--lp-s2)",
                  border: "1px solid transparent",
                  borderRadius: 16,
                  padding: 32,
                  borderColor: p.highlight ? "transparent" : "var(--lp-border)",
                  boxShadow: p.highlight ? "0 0 40px rgba(14,165,233,0.15)" : "none",
                }}
              >
                {p.highlight && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                    <span style={{
                      background: "var(--lp-grad)", color: "#fff",
                      fontSize: 11, fontWeight: 600, padding: "3px 12px",
                      borderRadius: 99, display: "flex", alignItems: "center", gap: 4,
                    }}>
                      <Zap size={10} /> Mais popular
                    </span>
                  </div>
                )}

                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--lp-text)", marginBottom: 4, fontFamily: "var(--font-display)" }}>
                  {p.name}
                </p>
                <p style={{ fontSize: 12, color: "var(--lp-muted2)", marginBottom: 20 }}>{p.desc}</p>

                <div style={{ marginBottom: 28 }}>
                  {p.monthlyPrice === 0 ? (
                    <p style={{ fontSize: 38, fontWeight: 800, color: "var(--lp-text)", fontFamily: "var(--font-display)" }}>
                      Grátis
                      <span style={{ fontSize: 14, fontWeight: 400, color: "var(--lp-muted)" }}> · 14 dias</span>
                    </p>
                  ) : (
                    <p style={{ fontSize: 38, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                      <span className={p.highlight ? "lp-grad-text" : ""} style={{ color: p.highlight ? undefined : "var(--lp-text)" }}>
                        R$ {price}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 400, color: "var(--lp-muted)" }}>/mês</span>
                    </p>
                  )}
                  {annual && p.annualPrice && (
                    <p style={{ fontSize: 12, color: "#14B8A6", marginTop: 4 }}>
                      Cobrado anualmente — R$ {p.annualPrice * 12}/ano
                    </p>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {p.features.map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <CheckCircle size={14} color={p.highlight ? "#0EA5E9" : "#14B8A6"} />
                      <span style={{ fontSize: 13, color: "var(--lp-muted)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link href="/register">
                  {p.highlight ? (
                    <button className="lp-btn" style={{ width: "100%", justifyContent: "center" }}>
                      {p.cta} <ArrowRight size={15} />
                    </button>
                  ) : (
                    <button style={{
                      width: "100%", padding: "12px", borderRadius: 10,
                      background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                      color: "var(--lp-muted)", fontSize: 14, fontWeight: 500,
                      cursor: "pointer", fontFamily: "inherit", display: "flex",
                      alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.color = "#fff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "var(--lp-muted)"; }}
                    >
                      {p.cta}
                    </button>
                  )}
                </Link>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "var(--lp-muted2)", marginTop: 24 }}>
          Sem cartão de crédito · Cancele quando quiser · Dados 100% seguros
        </p>
      </div>
    </section>
  );
}
