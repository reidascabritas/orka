export default function DashboardMockup() {
  return (
    <section style={{
      padding: "110px 48px",
      background: "var(--lp-bg)",
      position: "relative",
      overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 700, height: 500,
        background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--lp-cyan)", marginBottom: 14 }}>
            O produto
          </p>
          <h2 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4vw, 44px)",
            fontWeight: 800, letterSpacing: "-1px", color: "var(--lp-text)", lineHeight: 1.1,
          }}>
            Seu painel de controle inteligente
          </h2>
        </div>

        {/* Browser mockup */}
        <div style={{ position: "relative" }}>
          {/* Glow behind device */}
          <div style={{
            position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
            width: "80%", height: "60%",
            background: "radial-gradient(ellipse, rgba(14,165,233,0.2) 0%, transparent 70%)",
            filter: "blur(30px)", pointerEvents: "none", zIndex: 0,
          }} />

          <div style={{
            position: "relative", zIndex: 1,
            background: "var(--lp-s2)",
            border: "1px solid rgba(14,165,233,0.25)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(14,165,233,0.1)",
          }}>
            {/* Browser bar */}
            <div style={{
              background: "var(--lp-s1)", borderBottom: "1px solid var(--lp-border)",
              padding: "10px 16px", display: "flex", alignItems: "center", gap: 8,
            }}>
              {["#FF5F57","#FFBD2E","#28CA41"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 99, maxWidth: 240, margin: "0 auto" }} />
            </div>

            {/* Dashboard content */}
            <div style={{ padding: 24 }}>
              {/* Metric cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { label: "Receita 30d",    value: "R$ 84.320", sub: "+12.4%",    up: true  },
                  { label: "Pedidos",         value: "1.247",     sub: "+8.1%",     up: true  },
                  { label: "Produtos ativos", value: "342",        sub: "monitorados", up: true },
                  { label: "Anomalias",       value: "3",          sub: "atenção",  up: false },
                ].map((m) => (
                  <div key={m.label} style={{
                    background: "rgba(255,255,255,0.03)", border: "1px solid var(--lp-border)",
                    borderRadius: 10, padding: "14px 16px",
                  }}>
                    <p style={{ fontSize: 11, color: "var(--lp-muted2)", marginBottom: 6 }}>{m.label}</p>
                    <p style={{ fontSize: 20, fontWeight: 700, color: "var(--lp-text)", marginBottom: 4, fontFamily: "var(--font-display)" }}>{m.value}</p>
                    <span style={{ fontSize: 11, fontWeight: 500, color: m.up ? "#1D4ED8" : "#FFB547" }}>{m.sub}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
                {/* Chart */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--lp-border)", borderRadius: 10, padding: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--lp-muted)", marginBottom: 12 }}>Receita últimos 30 dias</p>
                  <svg viewBox="0 0 340 90" style={{ width: "100%", height: 90 }}>
                    <defs>
                      <linearGradient id="mock-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1D4ED8" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#1D4ED8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,70 C40,65 60,40 90,42 S140,28 170,30 S230,15 270,18 L320,14 L340,12 L340,90 L0,90Z" fill="url(#mock-grad)" />
                    <path d="M0,70 C40,65 60,40 90,42 S140,28 170,30 S230,15 270,18 L320,14 L340,12" fill="none" stroke="#1D4ED8" strokeWidth="2" />
                  </svg>
                </div>
                {/* Decisions */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--lp-border)", borderRadius: 10, padding: 16 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--lp-muted)", marginBottom: 12 }}>Decisões pendentes</p>
                  {[
                    { text: "Repor estoque — Produto A", color: "#FF4D6A" },
                    { text: "Promoção — Produto B",      color: "#1D4ED8" },
                    { text: "Ajustar preço — Produto C", color: "#FFB547" },
                  ].map((d) => (
                    <div key={d.text} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
                      <p style={{ fontSize: 12, color: "var(--lp-muted)", flex: 1 }}>{d.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badges */}
          <div style={{
            position: "absolute", top: "18%", right: -20,
            background: "rgba(13,13,26,0.9)", border: "1px solid rgba(14,165,233,0.4)",
            borderRadius: 10, padding: "10px 14px",
            backdropFilter: "blur(12px)", zIndex: 10,
            animation: "float 3s ease-in-out infinite",
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#1D4ED8" }}>↑ 23% receita</p>
            <p style={{ fontSize: 11, color: "var(--lp-muted2)" }}>esta semana</p>
          </div>
          <div style={{
            position: "absolute", bottom: "20%", left: -20,
            background: "rgba(13,13,26,0.9)", border: "1px solid rgba(255,77,106,0.4)",
            borderRadius: 10, padding: "10px 14px",
            backdropFilter: "blur(12px)", zIndex: 10,
            animation: "float 3.5s ease-in-out infinite 1s",
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#FF4D6A" }}>⚠ Estoque crítico</p>
            <p style={{ fontSize: 11, color: "var(--lp-muted2)" }}>Produto X — 3 un.</p>
          </div>
          <div style={{
            position: "absolute", top: "50%", right: -24,
            background: "rgba(13,13,26,0.9)", border: "1px solid rgba(34,197,94,0.4)",
            borderRadius: 10, padding: "10px 14px",
            backdropFilter: "blur(12px)", zIndex: 10,
            animation: "float 4s ease-in-out infinite 0.5s",
          }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#22C55E" }}>✓ Decisão aprovada</p>
            <p style={{ fontSize: 11, color: "var(--lp-muted2)" }}>Reabastecimento</p>
          </div>
        </div>
      </div>
    </section>
  );
}
