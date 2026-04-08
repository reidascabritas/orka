"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Waves } from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]     = useState({ name: "", email: "", password: "", org_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("orka_token", data.access_token);
      router.push("/dashboard");
    } catch (err) {
      const e = err as { response?: { data?: { detail?: string } } };
      setError(e?.response?.data?.detail || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label style={{ fontSize: 13, color: "#475569", display: "block", marginBottom: 6, fontWeight: 600 }}>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        required
      />
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 52, height: 52, borderRadius: 14,
            background: "linear-gradient(135deg, #1D4ED8, #0EA5E9)",
            marginBottom: 16,
            boxShadow: "0 4px 20px rgba(14,165,233,0.3)",
          }}>
            <Waves size={24} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>Criar conta</h1>
          <p style={{ fontSize: 14, color: "#475569", marginTop: 6 }}>Comece a usar a Orka gratuitamente</p>
        </div>

        <div style={{
          background: "#fff",
          border: "1px solid #BFDBFE",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 4px 24px rgba(29,78,216,0.08)",
        }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {field("name", "Seu nome", "text", "João Silva")}
            {field("email", "Email", "email", "seu@email.com")}
            {field("password", "Senha", "password", "••••••••")}
            {field("org_name", "Nome da loja / empresa", "text", "Minha Loja")}

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
              {loading ? <Spinner size={16} /> : "Criar conta"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#475569" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "#1D4ED8", textDecoration: "none", fontWeight: 600 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
