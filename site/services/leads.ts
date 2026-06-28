const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://www.virtualnaplanta.com.br/multi/api/v1";

export interface LeadInput {
  nome: string;
  telefone: string;
  email?: string;
  mensagem?: string;
  tipo?: "interesse" | "visita" | "proposta";
  codigo?: string;
  titulo?: string;
  finalidade?: "venda" | "locacao";
  origem?: string;
  _gotcha?: string; // honeypot — deixe vazio
}

/** Envia o lead pro pipeline completo do back office (banco + Imoview + WhatsApp). */
export async function postLead(data: LeadInput): Promise<{ status: string; lead_id?: number }> {
  const res = await fetch(`${API_BASE}/leads.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    let msg = "Não foi possível enviar agora. Tente novamente.";
    try {
      const j = await res.json();
      if (j?.erro) msg = j.erro;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}
