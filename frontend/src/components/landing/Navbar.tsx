"use client";
import Link from "next/link";
import { ArrowRight, Waves } from "lucide-react";

const links = [
  { href: "#features",     label: "Features" },
  { href: "#integrations", label: "Integrações" },
  { href: "#pricing",      label: "Preços" },
];

export default function Navbar() {
  return (
    <header style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200 }}>
      <nav className="lp-glass" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 36px", height: 64, margin: "10px 20px", borderRadius: 14,
        maxWidth: 1100, marginLeft: "auto", marginRight: "auto",
        boxShadow: "0 4px 24px rgba(0,0,0,0.25)",
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #1D4ED8, #0EA5E9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(14,165,233,0.3)",
          }}>
            <Waves size={16} color="#fff" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--lp-text)" }}>
            Orka
          </span>
        </Link>

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {links.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontSize: 14, color: "var(--lp-muted)", textDecoration: "none",
              padding: "6px 14px", borderRadius: 8, transition: "color 0.15s",
              fontWeight: 500,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--lp-text)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--lp-muted)")}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Link href="/login">
            <button style={{
              background: "transparent",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "var(--lp-muted)", borderRadius: 8, padding: "7px 16px",
              fontSize: 14, cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--lp-text)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--lp-muted)"; e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)"; }}
            >
              Entrar
            </button>
          </Link>
          <Link href="/register">
            <button className="lp-btn lp-btn-sm">
              Começar grátis <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
