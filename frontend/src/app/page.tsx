"use client";
import Link from "next/link";
import {
  Activity, Zap, BarChart2, Brain, Plug, Bell,
  ArrowRight, CheckCircle, ChevronRight, TrendingUp, ShieldCheck, Clock
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "IA Preditiva",
    desc: "Previsão de demanda com machine learning. Saiba o que vai vender antes que aconteça.",
    color: "#7C3AED",
  },
  {
    icon: Zap,
    title: "Decisões Automáticas",
    desc: "O sistema analisa seus dados e gera recomendações de reabastecimento, preço e promoção.",
    color: "#4F8EF7",
  },
  {
    icon: BarChart2,
    title: "Dashboard Unificado",
    desc: "Mercado Livre, Amazon e Shopify em um único painel com métricas em tempo real.",
    color: "#FFB547",
  },
  {
    icon: Bell,
    title: "Alertas Inteligentes",
    desc: "Detecção de anomalias automática. Receba alertas quando algo foge do padrão.",
    color: "#FF4D6A",
  },
  {
    icon: Plug,
    title: "Integrações Nativas",
    desc: "Conecte seus marketplaces com OAuth em menos de 2 minutos, sem configuração técnica.",
    color: "#00C896",
  },
  {
    icon: TrendingUp,
    title: "Relatórios Executivos",
    desc: "Relatórios semanais e mensais gerados automaticamente com análise de oportunidades.",
    color: "#A78BFA",
  },
];

const STEPS = [
  { num: "01", title: "Conecte suas lojas", desc: "Integre Mercado Livre, Amazon ou Shopify com OAuth em poucos cliques." },
  { num: "02", title: "A IA analisa seus dados", desc: "Nossos modelos processam histórico de vendas, estoque e métricas automaticamente." },
  { num: "03", title: "Receba decisões claras", desc: "Recomendações acionáveis de reabastecimento, preço e promoção aparecem no painel." },
];

const PLANS = [
  {
    id: "starter", name: "Starter", price: 197, desc: "Para quem está começando",
    features: ["1 integração", "100 produtos", "Dashboard completo", "Relatórios semanais"],
    highlight: false,
  },
  {
    id: "pro", name: "Pro", price: 497, desc: "Para lojas em crescimento",
    features: ["3 integrações", "1.000 produtos", "IA preditiva", "Decisões automáticas", "Suporte prioritário"],
    highlight: true,
  },
  {
    id: "scale", name: "Scale", price: 997, desc: "Para grandes operações",
    features: ["10 integrações", "Produtos ilimitados", "API dedicada", "Onboarding personalizado", "SLA garantido"],
    highlight: false,
  },
];

export default function LandingPage() {
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh", color: "var(--text)" }}>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(8,9,14,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 48px", height: 64,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={16} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700 }}>Orka</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login">
            <button className="btn btn-ghost btn-sm">Entrar</button>
          </Link>
          <Link href="/register">
            <button className="btn btn-primary btn-sm">Começar grátis</button>
          </Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop: 140, paddingBottom: 100, textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Glow background */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -60%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ position: "relative", maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <div className="badge badge-purple" style={{ marginBottom: 24, display: "inline-flex" }}>
            <Zap size={11} />
            Inteligência artificial para e-commerce
          </div>

          <h1 style={{
            fontSize: "clamp(36px, 6vw, 64px)",
            fontWeight: 800,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            marginBottom: 24,
            background: "linear-gradient(135deg, #E8E9F0 0%, #9899B0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Pare de adivinhar.<br />
            <span style={{
              background: "linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              Comece a decidir.
            </span>
          </h1>

          <p style={{ fontSize: 18, color: "var(--text2)", lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: "0 auto 40px" }}>
            A Orka conecta seus marketplaces e usa IA para gerar decisões de negócio em tempo real — reabastecimento, preços, promoções e alertas automáticos.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register">
              <button className="btn btn-primary" style={{ padding: "13px 28px", fontSize: 15, gap: 8 }}>
                Criar conta grátis <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/login">
              <button className="btn btn-ghost" style={{ padding: "13px 28px", fontSize: 15 }}>
                Ver demonstração
              </button>
            </Link>
          </div>

          <p style={{ fontSize: 12, color: "var(--text3)", marginTop: 16 }}>
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>

        {/* Fake dashboard preview */}
        <div style={{ maxWidth: 900, margin: "64px auto 0", padding: "0 24px", position: "relative" }}>
          <div style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,58,237,0.1)",
          }}>
            {/* Fake topbar */}
            <div style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)", padding: "12px 20px", display: "flex", alignItems: "center", gap: 8 }}>
              {["#FF5F57","#FFBD2E","#28CA41"].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c }} />
              ))}
              <div style={{ flex: 1, height: 6, background: "var(--border)", borderRadius: 99, maxWidth: 200, margin: "0 auto" }} />
            </div>
            {/* Fake content */}
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[
                { label: "Receita 30d",     value: "R$ 84.320", growth: "+12.4%", up: true },
                { label: "Pedidos",          value: "1.247",     growth: "+8.1%",  up: true },
                { label: "Produtos ativos",  value: "342",        growth: null,     up: true },
                { label: "Anomalias",        value: "3",          growth: "atenção",up: false },
              ].map((m) => (
                <div key={m.label} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                  <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8 }}>{m.label}</p>
                  <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>{m.value}</p>
                  {m.growth && (
                    <span style={{ fontSize: 11, color: m.up ? "#7C3AED" : "#FFB547", fontWeight: 500 }}>{m.growth}</span>
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: "0 24px 24px", display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
              {/* Fake chart */}
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16, height: 140, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)" }}>Receita últimos 30 dias</p>
                <svg viewBox="0 0 300 80" style={{ width: "100%", height: 80 }}>
                  <defs>
                    <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,60 C30,55 50,30 80,35 S130,20 160,25 S220,10 260,15 L300,12 L300,80 L0,80Z" fill="url(#pg)" />
                  <path d="M0,60 C30,55 50,30 80,35 S130,20 160,25 S220,10 260,15 L300,12" fill="none" stroke="#7C3AED" strokeWidth="2" />
                </svg>
              </div>
              {/* Fake top products */}
              <div style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text2)", marginBottom: 12 }}>Top produtos</p>
                {[85, 65, 45, 30].map((w, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 99 }}>
                      <div style={{ width: `${w}%`, height: "100%", background: "var(--green)", borderRadius: 99, opacity: 0.6 + i * 0.1 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Bottom fade */}
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: "linear-gradient(to top, var(--bg), transparent)", pointerEvents: "none" }} />
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section style={{ padding: "40px 48px", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", gap: 60, flexWrap: "wrap" }}>
        {[
          { value: "R$ 2M+",  label: "em GMV monitorado" },
          { value: "500+",    label: "lojas conectadas" },
          { value: "98%",     label: "de uptime" },
          { value: "3min",    label: "para integrar" },
        ].map(({ value, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--green)" }}>{value}</p>
            <p style={{ fontSize: 13, color: "var(--text3)", marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: "100px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Funcionalidades</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 16 }}>
            Tudo que seu e-commerce precisa
          </h2>
          <p style={{ fontSize: 16, color: "var(--text2)", maxWidth: 480, margin: "0 auto" }}>
            Da coleta de dados à decisão final — a Orka cuida de tudo automaticamente.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {FEATURES.map((f) => (
            <div key={f.title} className="card" style={{ padding: 24, transition: "border-color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = `${f.color}40`)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
            >
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${f.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <f.icon size={18} color={f.color} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{f.title}</p>
              <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: "100px 48px", background: "var(--surface)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Como funciona</p>
            <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              Configure em minutos
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative" }}>
            {/* connector line */}
            <div style={{ position: "absolute", top: 20, left: "16%", right: "16%", height: 1, background: "linear-gradient(to right, transparent, var(--border2), transparent)", zIndex: 0 }} />
            {STEPS.map((s) => (
              <div key={s.num} style={{ textAlign: "center", position: "relative", zIndex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "var(--surface2)", border: "1px solid var(--border2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px", fontSize: 13, fontWeight: 700, color: "var(--green)",
                }}>
                  {s.num}
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{s.title}</p>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={{ padding: "100px 48px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontSize: 13, color: "var(--green)", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>Preços</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 16 }}>
            Simples e transparente
          </h2>
          <p style={{ fontSize: 16, color: "var(--text2)" }}>Sem taxas escondidas. Cancele quando quiser.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {PLANS.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: 28,
                borderColor: p.highlight ? "rgba(124,58,237,0.5)" : "var(--border)",
                background: p.highlight ? "linear-gradient(135deg, rgba(124,58,237,0.08), var(--surface))" : "var(--surface)",
                position: "relative",
              }}
            >
              {p.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)" }}>
                  <span className="badge badge-purple" style={{ fontSize: 11 }}>Mais popular</span>
                </div>
              )}
              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{p.name}</p>
              <p style={{ fontSize: 12, color: "var(--text3)", marginBottom: 20 }}>{p.desc}</p>
              <p style={{ fontSize: 32, fontWeight: 800, color: p.highlight ? "var(--green)" : "var(--text)", marginBottom: 24 }}>
                R$ {p.price}
                <span style={{ fontSize: 14, fontWeight: 400, color: "var(--text2)" }}>/mês</span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={14} color="var(--green)" />
                    <span style={{ fontSize: 13, color: "var(--text2)" }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/register">
                <button
                  className={`btn ${p.highlight ? "btn-primary" : "btn-ghost"}`}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Começar agora <ChevronRight size={15} />
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: "100px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500, height: 300,
          background: "radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 16 }}>
            Pronto para crescer com IA?
          </h2>
          <p style={{ fontSize: 16, color: "var(--text2)", marginBottom: 36 }}>
            Junte-se a centenas de lojistas que já usam a Orka para tomar melhores decisões.
          </p>
          <Link href="/register">
            <button className="btn btn-primary" style={{ padding: "14px 32px", fontSize: 16, gap: 8 }}>
              Criar conta grátis <ArrowRight size={16} />
            </button>
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
            {[
              { icon: ShieldCheck, label: "Dados seguros" },
              { icon: Clock,       label: "Setup em 3 min" },
              { icon: Zap,         label: "Sem contrato" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon size={13} color="var(--text3)" />
                <span style={{ fontSize: 12, color: "var(--text3)" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid var(--border)", padding: "32px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Activity size={12} color="#fff" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Orka</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text3)" }}>© 2026 Orka. AI Intelligence Platform.</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Privacidade", "Termos", "Suporte"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "var(--text3)", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}
