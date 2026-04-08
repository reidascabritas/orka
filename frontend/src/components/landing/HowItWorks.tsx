const STEPS = [
  {
    num: "01",
    title: "Conecte",
    desc: "Autentique suas plataformas com OAuth seguro em menos de 2 minutos. Sem senha, sem configuração.",
  },
  {
    num: "02",
    title: "A IA analisa",
    desc: "Coletamos pedidos, estoque, receita e padrões históricos. Você não precisa fazer nada.",
  },
  {
    num: "03",
    title: "Receba decisões",
    desc: "Alertas, previsões e ações recomendadas chegam prontas no dashboard. Aprove com 1 clique.",
  },
];

export default function HowItWorks() {
  return (
    <section style={{
      padding: "110px 48px",
      background: "var(--lp-s1)",
      borderTop: "1px solid var(--lp-border)",
      borderBottom: "1px solid var(--lp-border)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 72 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--lp-purple)", marginBottom: 14 }}>
            Como funciona
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(30px, 4vw, 46px)",
            fontWeight: 800,
            letterSpacing: "-1px",
            color: "var(--lp-text)",
            lineHeight: 1.1,
          }}>
            3 passos. <span className="lp-grad-text">Resultado imediato.</span>
          </h2>
        </div>

        {/* Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, position: "relative" }}>
          {/* connector */}
          <div style={{
            position: "absolute", top: 28, left: "18%", right: "18%", height: 1,
            background: "linear-gradient(to right, transparent, rgba(14,165,233,0.4), rgba(59,130,246,0.4), transparent)",
          }} />

          {STEPS.map((s) => (
            <div key={s.num} className="lp-card" style={{ padding: 32, textAlign: "center" }}>
              <div style={{
                width: 56, height: 56, borderRadius: "50%",
                border: "1px solid rgba(14,165,233,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 24px",
                fontFamily: "var(--font-display)",
                fontSize: 18, fontWeight: 700,
                background: "linear-gradient(135deg, rgba(14,165,233,0.15), rgba(59,130,246,0.1))",
              }}>
                <span className="lp-grad-text" style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 800 }}>
                  {s.num}
                </span>
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: "var(--lp-text)", marginBottom: 12, fontFamily: "var(--font-display)" }}>
                {s.title}
              </p>
              <p style={{ fontSize: 14, color: "var(--lp-muted)", lineHeight: 1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
