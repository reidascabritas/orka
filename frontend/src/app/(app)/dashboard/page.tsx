"use client";
import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, ShoppingCart, Package, AlertTriangle, RefreshCw } from "lucide-react";
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
  const [summary, setSummary] = useState<Summary | null>(null);
  const [chart, setChart]     = useState<ChartPoint[]>([]);
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

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
          icon: TrendingUp,
          color: "var(--green)",
          colorDim: "var(--green-dim)",
        },
        {
          label: "Pedidos (30d)",
          value: formatNumber(summary.orders_30d),
          icon: ShoppingCart,
          color: "var(--blue)",
          colorDim: "var(--blue-dim)",
        },
        {
          label: "Produtos ativos",
          value: formatNumber(summary.total_products),
          icon: Package,
          color: "var(--purple)",
          colorDim: "var(--purple-dim)",
        },
        {
          label: "Anomalias",
          value: String(summary.active_anomalies),
          icon: AlertTriangle,
          color: summary.active_anomalies > 0 ? "var(--yellow)" : "var(--text3)",
          colorDim: summary.active_anomalies > 0 ? "var(--yellow-dim)" : "rgba(90,91,114,0.1)",
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        {metrics.map((m) => (
          <div key={m.label} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 13, color: "var(--text2)", fontWeight: 500 }}>{m.label}</span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: m.colorDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <m.icon size={16} color={m.color} />
              </div>
            </div>
            <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.5px" }}>{m.value}</p>
            {m.growth !== undefined && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
                {m.growth >= 0
                  ? <TrendingUp size={13} color="var(--green)" />
                  : <TrendingDown size={13} color="var(--red)" />}
                <span style={{ fontSize: 12, color: m.growth >= 0 ? "var(--green)" : "var(--red)", fontWeight: 500 }}>
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
              <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)" }}>Receita nos últimos 30 dias</p>
              <p style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>Atualizado em tempo real</p>
            </div>
          </div>
          {chart.length === 0 ? (
            <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text3)", fontSize: 13 }}>
              Nenhum dado ainda. Conecte uma integração.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chart} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="green-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#7C3AED" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fill: "var(--text3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(0)}k`} width={48} />
                <Tooltip
                  contentStyle={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: "var(--text2)" }}
                  formatter={(v) => [formatBRL(Number(v)), "Receita"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2} fill="url(#green-gradient)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top products */}
        <div className="card" style={{ padding: 24 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 16 }}>Top produtos</p>
          {products.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "var(--text3)", fontSize: 13 }}>
              Nenhum produto ainda.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {products.map((p, i) => {
                const maxRev = products[0]?.revenue || 1;
                const pct = (p.revenue / maxRev) * 100;
                return (
                  <div key={p.product_id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, color: "var(--text3)", fontWeight: 400, width: 16 }}>#{i + 1}</span>
                        {p.name}
                      </span>
                      <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>{formatBRL(p.revenue)}</span>
                    </div>
                    <div style={{ height: 3, background: "var(--border)", borderRadius: 99 }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "var(--green)", borderRadius: 99, transition: "width 0.6s ease" }} />
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
