"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity } from "lucide-react";
import api from "@/lib/api";
import Spinner from "@/components/ui/Spinner";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", org_name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", form);
      localStorage.setItem("orka_token", data.access_token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label style={{ fontSize: 13, color: "var(--text2)", display: "block", marginBottom: 6, fontWeight: 500 }}>{label}</label>
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
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: 12, background: "var(--green)", marginBottom: 16 }}>
            <Activity size={22} color="#000" strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text)" }}>Criar conta</h1>
          <p style={{ fontSize: 14, color: "var(--text2)", marginTop: 6 }}>Comece a usar a Orka gratuitamente</p>
        </div>

        <div className="card" style={{ padding: 28 }}>
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {field("name", "Seu nome", "text", "João Silva")}
            {field("email", "Email", "email", "seu@email.com")}
            {field("password", "Senha", "password", "••••••••")}
            {field("org_name", "Nome da loja / empresa", "text", "Minha Loja")}

            {error && (
              <div style={{ background: "var(--red-dim)", border: "1px solid rgba(255,77,106,0.2)", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "var(--red)" }}>
                {error}
              </div>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: 4, padding: "12px" }}>
              {loading ? <Spinner size={16} /> : "Criar conta"}
            </button>
          </form>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "var(--text2)" }}>
          Já tem conta?{" "}
          <Link href="/login" style={{ color: "var(--green)", textDecoration: "none", fontWeight: 500 }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
