"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Zap,
  Plug,
  Bell,
  FileText,
  CreditCard,
  LogOut,
  Waves,
} from "lucide-react";
import { useAuth } from "@/store/auth";

const nav = [
  { href: "/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/decisions",      label: "Decisões",        icon: Zap },
  { href: "/integrations",   label: "Integrações",     icon: Plug },
  { href: "/notifications",  label: "Notificações",    icon: Bell },
  { href: "/reports",        label: "Relatórios",      icon: FileText },
  { href: "/billing",        label: "Plano",           icon: CreditCard },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside
      style={{
        width: 240,
        minWidth: 240,
        background: "#0F172A",
        borderRight: "1px solid rgba(29,78,216,0.25)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{
        padding: "24px 20px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: "linear-gradient(135deg, #1D4ED8, #0EA5E9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 12px rgba(14,165,233,0.4)",
          }}>
            <Waves size={17} color="#fff" strokeWidth={2.2} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#F0F9FF" }}>Orka</span>
        </div>
        <p style={{ fontSize: 11, color: "rgba(122,180,212,0.7)", paddingLeft: 44, letterSpacing: "0.5px" }}>
          AI · E-commerce Intelligence
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "14px 10px", display: "flex", flexDirection: "column", gap: 2 }}>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? "#7DD3FC" : "rgba(148,163,184,0.85)",
                background: active ? "rgba(14,165,233,0.12)" : "transparent",
                borderLeft: active ? "2px solid #0EA5E9" : "2px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Divisor decorativo */}
      <div style={{
        margin: "0 16px",
        height: 1,
        background: "linear-gradient(90deg, transparent, rgba(14,165,233,0.25), transparent)",
      }} />

      {/* User */}
      <div style={{ padding: "16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1E3A5F, #1D4ED8)",
            border: "1.5px solid rgba(14,165,233,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#7DD3FC",
            flexShrink: 0,
          }}>
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "#E0F2FE", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 11, color: "rgba(122,180,212,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            color: "rgba(148,163,184,0.7)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)";
            e.currentTarget.style.color = "#EF4444";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "rgba(148,163,184,0.7)";
          }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
