"use client";
import { useEffect, useState } from "react";
import { Bell, CheckCheck, AlertTriangle, Lightbulb, Zap } from "lucide-react";
import api from "@/lib/api";
import Header from "@/components/layout/Header";
import Spinner from "@/components/ui/Spinner";
import { formatDate } from "@/lib/utils";

interface Notification {
  id: string;
  type: "alerta" | "oportunidade" | "acao";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const typeConfig = {
  alerta:       { icon: AlertTriangle, color: "var(--yellow)", cls: "badge-yellow", label: "Alerta" },
  oportunidade: { icon: Lightbulb,     color: "var(--blue)",   cls: "badge-blue",   label: "Oportunidade" },
  acao:         { icon: Zap,           color: "var(--green)",  cls: "badge-green",  label: "Ação" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/notifications/?unread_only=${unreadOnly}`);
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [unreadOnly]);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    await api.post("/notifications/read-all");
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <>
      <Header
        title="Notificações"
        subtitle={unreadCount > 0 ? `${unreadCount} não lida${unreadCount > 1 ? "s" : ""}` : "Tudo em dia"}
        action={
          unreadCount > 0 ? (
            <button className="btn btn-ghost btn-sm" onClick={markAllRead}>
              <CheckCheck size={14} /> Marcar todas como lidas
            </button>
          ) : undefined
        }
      />

      <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
        {[
          { v: false, label: "Todas" },
          { v: true,  label: "Não lidas" },
        ].map(({ v, label }) => (
          <button
            key={String(v)}
            onClick={() => setUnreadOnly(v)}
            className="btn btn-sm"
            style={{
              background: unreadOnly === v ? "var(--green-dim)" : "transparent",
              color: unreadOnly === v ? "var(--green)" : "var(--text2)",
              border: `1px solid ${unreadOnly === v ? "rgba(0,211,122,0.3)" : "var(--border)"}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={24} /></div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: "center" }}>
          <Bell size={32} color="var(--text3)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text2)", fontSize: 15 }}>Nenhuma notificação</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] ?? typeConfig.alerta;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: 18,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  opacity: n.is_read ? 0.6 : 1,
                  cursor: !n.is_read ? "pointer" : "default",
                  transition: "opacity 0.15s",
                }}
                onClick={() => !n.is_read && markRead(n.id)}
              >
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${cfg.color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
                    {!n.is_read && (
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", display: "inline-block" }} />
                    )}
                    <span style={{ fontSize: 11, color: "var(--text3)", marginLeft: "auto" }}>
                      {n.created_at ? formatDate(n.created_at) : ""}
                    </span>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 2 }}>{n.title}</p>
                  <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.5 }}>{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
