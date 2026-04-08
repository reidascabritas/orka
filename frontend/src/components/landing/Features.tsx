import { Plug, Brain, BarChart2, Zap, Bell, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: Plug,
    title: "Conecte em 1 clique",
    desc: "Mercado Livre, Amazon, Shopify e mais. OAuth seguro, dados em tempo real sem configuração técnica.",
    grad: "linear-gradient(135deg, #1D4ED8, #0EA5E9)",
  },
  {
    icon: Brain,
    title: "IA que age por você",
    desc: "O sistema detecta oportunidades e problemas antes que você perceba. Recomendações prontas para executar.",
    grad: "linear-gradient(135deg, #0EA5E9, #14B8A6)",
  },
  {
    icon: BarChart2,
    title: "Visão cross-channel",
    desc: "Todos os seus canais de venda em um único painel inteligente. Receita, estoque e margens unificados.",
    grad: "linear-gradient(135deg, #6366F1, #1D4ED8)",
  },
  {
    icon: Zap,
    title: "Decisões automáticas",
    desc: "Reabastecimento, ajuste de preço, promoções. A IA gera e você aprova com 1 clique.",
    grad: "linear-gradient(135deg, #0EA5E9, #1D4ED8)",
  },
  {
    icon: Bell,
    title: "Alertas inteligentes",
    desc: "Detecção de anomalias em tempo real. Receba alertas quando algo foge do padrão esperado.",
    grad: "linear-gradient(135deg, #1D4ED8, #6366F1)",
  },
  {
    icon: TrendingUp,
    title: "Relatórios executivos",
    desc: "Gerados automaticamente toda semana. Resumo, problemas, oportunidades e plano de ação.",
    grad: "linear-gradient(135deg, #14B8A6, #0EA5E9)",
  },
];

export default function Features() {
  return (
    <section id="features" style={{
      padding: "110px 48px",
      background: "var(--lp-bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* subtle bg glow */}
      <div style={{
        position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400,
        background: "radial-gradient(ellipse, rgba(14,165,233,0.06) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1060, margin: "0 auto", position: "relative" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--lp-cyan)", marginBottom: 14 }}>
            Funcionalidades
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 4vw, 48px)",
            fontWeight: 800,
            letterSpacing: "-1px",
            color: "var(--lp-text)",
            marginBottom: 16,
            lineHeight: 1.1,
          }}>
            Tudo que seu negócio precisa.<br />
            <span className="lp-grad-text">Sem complexidade.</span>
          </h2>
          <p style={{ fontSize: 17, color: "var(--lp-muted)", maxWidth: 480, margin: "0 auto" }}>
            Da coleta de dados à decisão final — a Orka cuida de tudo automaticamente.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: 16 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="lp-card" style={{ padding: 28, transition: "all 0.25s", cursor: "default" }}>
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: f.grad,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 20,
                boxShadow: "0 4px 20px rgba(14,165,233,0.25)",
              }}>
                <f.icon size={20} color="#fff" />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--lp-text)", marginBottom: 10, fontFamily: "var(--font-display)" }}>
                {f.title}
              </p>
              <p style={{ fontSize: 14, color: "var(--lp-muted)", lineHeight: 1.7 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
