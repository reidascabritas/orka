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
  Activity,
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
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "24px 20px 8px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Activity size={16} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Orka</span>
        </div>
        <p style={{ fontSize: 12, color: "var(--text3)", paddingLeft: 42 }}>
          AI Intelligence
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
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
                color: active ? "var(--green)" : "var(--text2)",
                background: active ? "var(--green-dim)" : "transparent",
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

      {/* User */}
      <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--surface2)",
              border: "1px solid var(--border2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              fontWeight: 600,
              color: "var(--green)",
              flexShrink: 0,
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div style={{ overflow: "hidden" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.name}
            </p>
            <p style={{ fontSize: 11, color: "var(--text3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user?.email}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="btn btn-ghost btn-sm"
          style={{ width: "100%", justifyContent: "flex-start", gap: 8 }}
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </aside>
  );
}
