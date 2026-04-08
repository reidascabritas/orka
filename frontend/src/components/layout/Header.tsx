"use client";
import { Bell } from "lucide-react";
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
        paddingBottom: 20,
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px" }}>{title}</h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: "var(--text2)", marginTop: 3 }}>{subtitle}</p>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {action}
        <Link href="/notifications" style={{ textDecoration: "none" }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: "8px", position: "relative" }}
          >
            <Bell size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
}
