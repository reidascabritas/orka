"use client";
import { Bell, RefreshCw } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function Header({ title, subtitle, action }: HeaderProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
      }}
    >
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)" }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 2 }}>{subtitle}</p>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {action}
        <Link href="/notifications" style={{ textDecoration: "none" }}>
          <button className="btn btn-ghost btn-sm" style={{ padding: "8px" }}>
            <Bell size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
}
