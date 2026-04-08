import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    avatar: "#1D4ED8",
    initials: "CS",
    name: "Carlos S.",
    role: "Loja de eletrônicos · Mercado Livre",
    text: "Em 3 dias a Orka identificou que eu estava com estoque zero de 2 produtos top-sellers. Antes eu só descobria depois de perder vendas.",
  },
  {
    avatar: "#3B82F6",
    initials: "MF",
    name: "Marina F.",
    role: "Moda feminina · Shopify + Amazon",
    text: "O dashboard unificado mudou completamente como eu gerencio o negócio. Ver tudo em um lugar e receber recomendações prontas é absurdamente útil.",
  },
  {
    avatar: "#06B6D4",
    initials: "RP",
    name: "Rafael P.",
    role: "Suplementos · Multi-canal",
    text: "As decisões de reabastecimento automáticas já me pouparam mais de 20h por mês. A IA acerta com frequência impressionante.",
  },
];

export default function Testimonials() {
  return (
    <section style={{
      padding: "110px 48px",
      background: "var(--lp-bg)",
      borderTop: "1px solid var(--lp-border)",
    }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--lp-purple)", marginBottom: 14 }}>
            Depoimentos
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 800, letterSpacing: "-1px", color: "var(--lp-text)", lineHeight: 1.1,
          }}>
            Lojas que já tomam decisões com IA.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="lp-card" style={{ padding: 28 }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="#FFB547" color="#FFB547" />)}
              </div>
              <p style={{ fontSize: 14, color: "var(--lp-muted)", lineHeight: 1.8, marginBottom: 24, fontStyle: "italic" }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: t.avatar,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: "#fff",
                }}>
                  {t.initials}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--lp-text)" }}>{t.name}</p>
                  <p style={{ fontSize: 11, color: "var(--lp-muted2)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
