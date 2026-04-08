"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import { useAuth } from "@/store/auth";
import Spinner from "@/components/ui/Spinner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { loading, fetchMe } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("orka_token") : null;
    if (!token) { router.replace("/login"); return; }
    fetchMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      }}>
        <div style={{ textAlign: "center" }}>
          <Spinner size={32} />
          <p style={{ marginTop: 12, fontSize: 13, color: "#475569" }}>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: 240,
        padding: "28px 32px",
        minHeight: "100vh",
        overflow: "auto",
      }}>
        {children}
      </main>
    </div>
  );
}
