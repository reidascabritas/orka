"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Waves } from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("orka_token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #1D4ED8, #0EA5E9)",
            marginBottom: 16,
            boxShadow: "0 4px 20px rgba(14,165,233,0.3)",
          }}>
            <Waves size={24} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>Entrar na Orka</h1>
          <p style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>Inteligência artificial para seu e-commerce</p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff",
          border: "1px solid #BFDBFE",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 4px 24px rgba(29,78,216,0.08)",
        }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            <div>
              <label style={{ fontSize: 13, color: "#475569", display: "block", marginBottom: 6, fontWeight: 600 }}>
                Email
              </label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>

            <div>
              <label style={{ fontSize: 13, color: "#475569", display: "block", marginBottom: 6, fontWeight: 600 }}>
                Senha
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#94A3B8",
                    display: "flex",
                  }}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#EF4444",
              }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: "100%", marginTop: 4, padding: "12px" }}
            >
              {loading ? <Spinner size={16} /> : "Entrar"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#475569" }}>
          Não tem conta?{" "}
          <Link href="/register" style={{ color: "#1D4ED8", textDecoration: "none", fontWeight: 600 }}>
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  );
}
