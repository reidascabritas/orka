"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, TrendingUp, ShieldCheck } from "lucide-react";

const AVATARS = ["#1D4ED8","#0EA5E9","#14B8A6","#6366F1"];

export default function Hero() {
  const [email, setEmail] = useState("");

  return (
    <section style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center",
      padding: "120px 24px 80px",
      position: "relative",
      overflow: "hidden",
      background: "var(--lp-bg)",
    }}>
      {/* Raios de luz oceânicos */}
      <div style={{
        position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
        width: 900, height: 700,
        background: "radial-gradient(ellipse, rgba(14,165,233,0.14) 0%, rgba(29,78,216,0.08) 40%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 100, left: -100, width: 500, height: 600,
        background: "radial-gradient(ellipse, rgba(29,78,216,0.10) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: 50, right: -100, width: 500, height: 600,
        background: "radial-gradient(ellipse, rgba(14,165,233,0.08) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      {/* Grade oceânica sutil */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(14,165,233,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(14,165,233,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
      }} />

      {/* Badge */}
      <div className="lp-animate lp-d1" style={{
        position: "relative", zIndex: 1,
        display: "inline-flex", alignItems: "center", gap: 8,
        background: "rgba(14,165,233,0.08)",
        border: "1px solid rgba(14,165,233,0.22)",
        borderRadius: 99, padding: "6px 16px", marginBottom: 32,
      }}>
        <span className="pulse-dot" />
        <span style={{ fontSize: 13, color: "var(--lp-muted)", fontWeight: 500 }}>
          Early Access — Conecte seu e-commerce hoje
        </span>
      </div>

      {/* Headline */}
      <h1 className="lp-animate lp-d2" style={{
        position: "relative", zIndex: 1,
        fontSize: "clamp(48px, 7.5vw, 84px)",
        fontWeight: 900,
        lineHeight: 1.05,
        letterSpacing: "-2.5px",
        color: "var(--lp-text)",
        marginBottom: 24,
        maxWidth: 820,
      }}>
        Seus dados.<br />
        Seu marketplace.<br />
        <span className="lp-grad-text">Uma IA no comando.</span>
      </h1>

      {/* Sub */}
      <p className="lp-animate lp-d3" style={{
        position: "relative", zIndex: 1,
        fontSize: "clamp(16px, 2vw, 19px)",
        color: "var(--lp-muted)",
        lineHeight: 1.75,
        maxWidth: 520,
        marginBottom: 44,
      }}>
        Conecte o Mercado Livre, Amazon e Shopify.<br />
        A Orka analisa, detecta anomalias e entrega decisões prontas —<br />
        sem dashboards complicados.
      </p>

      {/* CTA */}
      <div className="lp-animate lp-d4" style={{
        position: "relative", zIndex: 1,
        display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center",
        marginBottom: 24, width: "100%", maxWidth: 540,
      }}>
        <input
          type="email"
          placeholder="✉ Digite seu melhor e-mail..."
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{
            flex: 1, minWidth: 220,
            background: "rgba(9,22,41,0.85)",
            border: "1px solid rgba(14,165,233,0.25)",
            borderRadius: 10, padding: "12px 16px",
            fontSize: 14, color: "var(--lp-text)",
            outline: "none", fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onFocus={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.6)")}
          onBlur={e => (e.currentTarget.style.borderColor = "rgba(14,165,233,0.25)")}
        />
        <Link href={`/register${email ? `?email=${encodeURIComponent(email)}` : ""}`}>
          <button className="lp-btn" style={{ padding: "12px 24px" }}>
            Começar grátis <ArrowRight size={15} />
          </button>
        </Link>
      </div>

      {/* Stats rápidas */}
      <div className="lp-animate lp-d4" style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap", justifyContent: "center",
        marginBottom: 20,
      }}>
        {[
          { icon: TrendingUp, value: "+34%", label: "receita média" },
          { icon: ShieldCheck, value: "99,9%", label: "uptime" },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "rgba(14,165,233,0.12)",
              border: "1px solid rgba(14,165,233,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon size={14} color="var(--lp-cyan)" />
            </div>
            <div>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--lp-text)" }}>{value} </span>
              <span style={{ fontSize: 12, color: "var(--lp-muted)" }}>{label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Social proof */}
      <div className="lp-animate lp-d5" style={{
        position: "relative", zIndex: 1,
        display: "flex", alignItems: "center", gap: 12, justifyContent: "center", flexWrap: "wrap",
      }}>
        <div style={{ display: "flex" }}>
          {AVATARS.map((c, i) => (
            <div key={i} style={{
              width: 28, height: 28, borderRadius: "50%",
              background: c, border: "2px solid var(--lp-bg)",
              marginLeft: i > 0 ? -8 : 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 700, color: "#fff",
            }}>
              {["M","A","S","R"][i]}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={11} fill="#F59E0B" color="#F59E0B" />)}
        </div>
        <span style={{ fontSize: 13, color: "var(--lp-muted)" }}>
          <strong style={{ color: "var(--lp-text)" }}>200+</strong> lojas conectadas · Sem cartão de crédito
        </span>
      </div>
    </section>
  );
}
