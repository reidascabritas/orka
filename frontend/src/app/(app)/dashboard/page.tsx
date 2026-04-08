"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ShoppingCart, Package, AlertTriangle, RefreshCw, DollarSign } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import api from "@/lib/api";
import Header from "@/components/layout/Header";
import Spinner from "@/components/ui/Spinner";
import { formatBRL, formatNumber, formatGrowth } from "@/lib/utils";

interface Summary {
  revenue_30d: number;
  revenue_growth_pct: number;
  orders_30d: number;
  total_products: number;
  active_anomalies: number;
}

interface ChartPoint { date: string; revenue: number; }
interface TopProduct  { product_id: string; name: string; revenue: number; units_sold: number; }

export default function DashboardPage() {
  const [summary, setSummary]   = useState<Summary | null>(null);
  const [chart, setChart]       = useState<ChartPoint[]>([]);
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [s, c, p] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/revenue-chart?days=30"),
        api.get("/dashboard/top-products?limit=5"),
      ]);
      setSummary(s.data);
      setChart(c.data.data);
      setProducts(p.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400 }}>
        <Spinner size={28} />
      </div>
    );
  }

  const metrics = summary
    ? [
        {
          label: "Receita (30d)",
          value: formatBRL(summary.revenue_30d),
          growth: summary.revenue_growth_pct,
          icon: DollarSign,
          color: "#1D4ED8",
          colorDim: "rgba(29,78,216,0.10)",
          accent: "#1D4ED8",
        },
        {
          label: "Pedidos (30d)",
          value: formatNumber(summary.orders_30d),
          icon: ShoppingCart,
          color: "#0EA5E9",
          colorDim: "rgba(14,165,233,0.10)",
          accent: "#0EA5E9",
        },
        {
          label: "Produtos ativos",
          value: formatNumber(summary.total_products),
          icon: Package,
          color: "#6366F1",
          colorDim: "rgba(99,102,241,0.10)",
          accent: "#6366F1",
        },
        {
          label: "Anomalias",
          value: String(summary.active_anomalies),
          icon: AlertTriangle,
          color: summary.active_anomalies > 0 ? "#F59E0B" : "#94A3B8",
          colorDim: summary.active_anomalies > 0 ? "rgba(245,158,11,0.10)" : "rgba(148,163,184,0.10)",
          accent: summary.active_anomalies > 0 ? "#F59E0B" : "#94A3B8",
        },
      ]
    : [];

  return (
    <>
      <Header
        title="Dashboard"
        subtitle="Visão geral do seu negócio"
        action={
          <button className="btn btn-ghost btn-sm" onClick={load} style={{ gap: 6 }}>
            <RefreshCw size={14} />
            Atualizar
          </button>
        }
      />

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {metrics.map((m) => (
          <div
            key={m.label}
            className="card"
            style={{
              padding: 20,
              borderTop: `3px solid ${m.accent}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative wave background */}
            <div style={{
              position: "absolute",
              bottom: -20,
              right: -20,
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: m.colorDim,
              pointerEvents: "none",
            }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: m.colorDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <m.icon size={16} color={m.color} />
              </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.5px" }}>{m.value}</p>
            {m.growth !== undefined && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                {m.growth >= 0
                  ? <TrendingUp size={13} color="#1D4ED8" />
                  : <TrendingDown size={13} color="var(--red)" />}
                <span style={{ fontSize: 12, color: m.growth >= 0 ? "#1D4ED8" : "var(--red)", fontWeight: 600 }}>
                  {formatGrowth(m.growth)} vs mês anterior
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>

        {/* Revenue chart */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Receita nos últimos 30 dias</p>
              <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Atualizado em tempo real</p>
            </div>
            <span className="badge badge-blue" style={{ fontSize: 11 }}>30d</span>
          </div>
          {chart.length === 0 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>
              Nenhum dado ainda. Conecte uma integração.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="ocean-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#1D4ED8" stopOpacity={0.20} />
                    <stop offset="50%"  stopColor="#0EA5E9" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--text3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={d => d.slice(5)}
                />
                <YAxis
                  tick={{ fill: "var(--text3)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `R$${(v/1000).toFixed(0)}k`}
                  width={48}
                />
                <Tooltip
                  contentStyle={{
                    background: "#0F172A",
                    border: "1px solid rgba(29,78,216,0.3)",
                    borderRadius: 8,
                    fontSize: 13,
                    color: "#F0F9FF",
                  }}
                  labelStyle={{ color: "#7AB4D4" }}
                  formatter={(v) => [formatBRL(Number(v)), "Receita"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1D4ED8"
                  strokeWidth={2.5}
                  fill="url(#ocean-gradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: "#0EA5E9", stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>Top produtos</p>
            <span className="badge badge-green" style={{ fontSize: 11 }}>por receita</span>
          </div>
          {products.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "var(--text3)", fontSize: 13 }}>
              Nenhum produto ainda.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {products.map((p, i) => {
                const maxRev = products[0]?.revenue || 1;
                const pct    = (p.revenue / maxRev) * 100;
                return (
                  <div key={p.product_id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: 4,
                          background: i === 0 ? "rgba(29,78,216,0.12)" : "rgba(148,163,184,0.10)",
                          color: i === 0 ? "#1D4ED8" : "var(--text3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {i + 1}
                        </span>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 13, color: "#1D4ED8", fontWeight: 700 }}>{formatBRL(p.revenue)}</span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 99 }}>
                      <div style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: i === 0
                          ? "linear-gradient(90deg, #1D4ED8, #0EA5E9)"
                          : "rgba(29,78,216,0.4)",
                        borderRadius: 99,
                        transition: "width 0.6s ease",
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
