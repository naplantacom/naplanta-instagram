"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { postLead, type LeadInput } from "@/services/leads";

type Props = {
  origem?: string;
  tipo?: LeadInput["tipo"];
  codigo?: string;
  titulo?: string;
  finalidade?: LeadInput["finalidade"];
  mensagemPadrao?: string;
};

export function LeadForm({ origem = "Contato", tipo, codigo, titulo, finalidade, mensagemPadrao = "" }: Props) {
  const [form, setForm] = useState({ nome: "", telefone: "", email: "", mensagem: mensagemPadrao, _gotcha: "" });
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [erro, setErro] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.telefone.trim()) {
      setErro("Preencha nome e telefone.");
      setState("error");
      return;
    }
    setState("sending");
    setErro("");
    try {
      await postLead({ ...form, origem, tipo, codigo, titulo, finalidade });
      setState("ok");
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao enviar.");
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-center shadow-card ring-1 ring-black/5">
        <CheckCircle2 className="h-12 w-12 text-brand" />
        <h3 className="font-display text-xl font-bold text-ink">Recebemos seu contato!</h3>
        <p className="text-ink-muted">Um corretor da NaPlanta vai falar com você em breve.</p>
      </div>
    );
  }

  const input = "w-full rounded-xl bg-neutral-100 px-4 py-3 text-sm text-ink outline-none focus:ring-2 focus:ring-brand/30";

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl bg-white p-6 shadow-card ring-1 ring-black/5">
      <input
        type="text"
        value={form.nome}
        onChange={(e) => set("nome", e.target.value)}
        placeholder="Seu nome *"
        className={input}
        autoComplete="name"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="tel"
          value={form.telefone}
          onChange={(e) => set("telefone", e.target.value)}
          placeholder="WhatsApp / telefone *"
          className={input}
          autoComplete="tel"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="E-mail"
          className={input}
          autoComplete="email"
        />
      </div>
      <textarea
        value={form.mensagem}
        onChange={(e) => set("mensagem", e.target.value)}
        placeholder="Mensagem (opcional)"
        rows={4}
        className={input}
      />

      {/* honeypot anti-spam (escondido) */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={form._gotcha}
        onChange={(e) => set("_gotcha", e.target.value)}
        className="hidden"
        aria-hidden="true"
      />

      {state === "error" && erro && <p className="text-sm text-brand-600">{erro}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 disabled:opacity-60"
      >
        {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {state === "sending" ? "Enviando…" : "Enviar"}
      </button>
      <p className="text-center text-xs text-ink-muted">Seus dados vão direto para nossa equipe. Sem spam.</p>
    </form>
  );
}
