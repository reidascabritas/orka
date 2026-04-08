import Link from "next/link";
import { GitBranch, ArrowLeft, GitCommit, Code2, Rocket } from "lucide-react";

const UPDATES = [
  {
    date: "Abr 2025",
    tag: "Launch",
    color: "#1D4ED8",
    title: "Landing page ao ar",
    desc: "Publicamos a landing page da Orka com design premium, seção de pricing e onboarding. Primeiro passo público do projeto.",
  },
  {
    date: "Mar 2025",
    tag: "Feature",
    color: "#3B82F6",
    title: "Dashboard + IA completos",
    desc: "Dashboard unificado com métricas cross-channel, engine de decisões automáticas e modelos de ML para previsão de demanda e detecção de anomalias.",
  },
  {
    date: "Mar 2025",
    tag: "Backend",
    color: "#06B6D4",
    title: "API FastAPI completa",
    desc: "31 endpoints documentados: auth, dashboard, decisões, ML, relatórios, notificações, integrações e billing. PostgreSQL + Alembic migrations.",
  },
  {
    date: "Fev 2025",
    tag: "Início",
    color: "#22C55E",
    title: "Orka começa a ser construída",
    desc: "Ideia: uma plataforma de IA para lojistas de e-commerce tomarem decisões com dados. Primeiro commit no repositório.",
  },
];

const STATS = [
  { value: "31", label: "endpoints na API" },
  { value: "8",  label: "serviços de backend" },
  { value: "6",  label: "integrações planejadas" },
  { value: "0",  label: "investimento externo" },
];

export default function BuildInPublicPage() {
  return (
    <div style={{ background: "var(--lp-bg)", minHeight: "100vh", color: "var(--lp-text)" }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(7,7,18,0.85)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--lp-border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, color: "var(--lp-muted)" }}>
          <ArrowLeft size={16} />
          <span style={{ fontSize: 14 }}>Voltar ao início</span>
        </Link>
        <p style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--lp-text)" }}>
          orka<span style={{ color: "var(--lp-purple)" }}>.</span>
        </p>
        <a
          href="https://github.com/reidascabritas/orka"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "var(--lp-muted)", textDecoration: "none" }}
        >
          <GitBranch size={16} />
          GitHub
        </a>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "120px 48px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 64 }}>
          <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", color: "var(--lp-purple)", marginBottom: 14 }}>
            Build in Public
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.1, marginBottom: 20,
          }}>
            Construindo a Orka<br />
            <span className="lp-grad-text">em público.</span>
          </h1>
          <p style={{ fontSize: 17, color: "var(--lp-muted)", lineHeight: 1.7, maxWidth: 540, marginBottom: 28 }}>
            Estamos construindo a Orka de forma transparente — compartilhando cada decisão, aprendizado e erro ao longo do caminho.
          </p>
          <a
            href="https://github.com/reidascabritas/orka"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              fontSize: 14, fontWeight: 500, color: "#fff",
              background: "rgba(14,165,233,0.15)", border: "1px solid rgba(14,165,233,0.35)",
              borderRadius: 10, padding: "10px 18px", textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <GitBranch size={16} />
            Ver código no GitHub
            <span style={{ fontSize: 11, background: "rgba(14,165,233,0.2)", borderRadius: 6, padding: "2px 8px", color: "var(--lp-purple)" }}>
              reidascabritas/orka
            </span>
          </a>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 64 }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              background: "var(--lp-s2)", border: "1px solid var(--lp-border)",
              borderRadius: 12, padding: "20px 16px", textAlign: "center",
            }}>
              <p style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--lp-text)", marginBottom: 4 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 12, color: "var(--lp-muted2)" }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Manifesto */}
        <div style={{
          background: "var(--lp-s2)", border: "1px solid rgba(14,165,233,0.2)",
          borderRadius: 16, padding: 32, marginBottom: 64,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Rocket size={18} color="var(--lp-purple)" />
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--lp-text)", fontFamily: "var(--font-display)" }}>Por que build in public?</p>
          </div>
          <p style={{ fontSize: 15, color: "var(--lp-muted)", lineHeight: 1.8, marginBottom: 12 }}>
            Acreditamos que transparência gera confiança. Ao construir a Orka abertamente, aprendemos mais rápido, recebemos feedback real e criamos uma comunidade em torno do produto antes mesmo do lançamento.
          </p>
          <p style={{ fontSize: 15, color: "var(--lp-muted)", lineHeight: 1.8 }}>
            Todo o código está disponível no GitHub. Toda decisão de produto será compartilhada aqui.
          </p>
        </div>

        {/* Timeline */}
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--lp-muted2)", marginBottom: 32, display: "flex", alignItems: "center", gap: 8 }}>
            <GitCommit size={15} />
            Histórico de updates
          </p>

          <div style={{ position: "relative" }}>
            {/* vertical line */}
            <div style={{
              position: "absolute", left: 11, top: 0, bottom: 0,
              width: 1, background: "var(--lp-border)",
            }} />

            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {UPDATES.map((u, i) => (
                <div key={i} style={{ display: "flex", gap: 24, paddingBottom: 40, position: "relative" }}>
                  {/* dot */}
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: "var(--lp-bg)", border: `2px solid ${u.color}`,
                    flexShrink: 0, marginTop: 2, zIndex: 1,
                    boxShadow: `0 0 8px ${u.color}40`,
                  }} />

                  <div style={{ flex: 1, paddingTop: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: "2px 10px", borderRadius: 99,
                        background: `${u.color}15`, color: u.color, border: `1px solid ${u.color}30`,
                      }}>
                        {u.tag}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--lp-muted2)" }}>{u.date}</span>
                    </div>
                    <p style={{ fontSize: 17, fontWeight: 700, color: "var(--lp-text)", marginBottom: 8, fontFamily: "var(--font-display)" }}>
                      {u.title}
                    </p>
                    <p style={{ fontSize: 14, color: "var(--lp-muted)", lineHeight: 1.7 }}>
                      {u.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What's next */}
        <div style={{
          background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(59,130,246,0.06))",
          border: "1px solid rgba(14,165,233,0.2)", borderRadius: 16, padding: 32, marginTop: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <Code2 size={18} color="var(--lp-purple)" />
            <p style={{ fontSize: 16, fontWeight: 700, fontFamily: "var(--font-display)", color: "var(--lp-text)" }}>Próximos passos</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              "Integração real com API do Mercado Livre",
              "Primeiros usuários beta e feedback",
              "Billing com AbacatePay",
              "App mobile (React Native)",
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--lp-purple)", flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: "var(--lp-muted)" }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 64, paddingTop: 32, borderTop: "1px solid var(--lp-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: 14, color: "var(--lp-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <ArrowLeft size={14} />
            Voltar ao início
          </Link>
          <a href="https://github.com/reidascabritas/orka" target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 14, color: "var(--lp-muted)", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            <GitBranch size={14} />
            Ver no GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
