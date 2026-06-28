import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a NaPlanta Imobiliária coleta, usa e protege seus dados pessoais (LGPD).",
};

export default function PrivacidadePage() {
  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">Política de Privacidade</h1>
          <p className="mt-2 text-ink-muted">Última atualização: junho de 2026</p>
        </div>
      </section>

      <section className="container py-12">
        <div className="prose-naplanta max-w-3xl space-y-6 text-ink-soft leading-relaxed">
          <p>
            A <strong>NaPlanta.com Imobiliária Ltda</strong> (CRECI 8123J) respeita a sua privacidade e está
            comprometida com a proteção dos seus dados pessoais, em conformidade com a Lei Geral de Proteção
            de Dados (Lei nº 13.709/2018 — LGPD).
          </p>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">1. Dados que coletamos</h2>
            <p>Coletamos as informações que você nos fornece ao preencher formulários de contato, interesse em
              imóveis ou simulações — como nome, telefone/WhatsApp, e-mail e mensagens. Também podemos coletar
              dados de navegação para melhorar a experiência no site.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">2. Como usamos seus dados</h2>
            <p>Utilizamos seus dados para responder a solicitações, apresentar imóveis, encaminhar você a um
              corretor, realizar atendimento e enviar informações relevantes sobre imóveis e serviços.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">3. Compartilhamento</h2>
            <p>Seus dados podem ser compartilhados internamente com nossa equipe de corretores e com sistemas
              de gestão (CRM) para o atendimento. Não vendemos seus dados a terceiros.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">4. Seus direitos</h2>
            <p>Você pode solicitar acesso, correção ou exclusão dos seus dados, bem como revogar o consentimento,
              a qualquer momento, pelo e-mail <a href="mailto:contato@naplanta.com" className="text-brand">contato@naplanta.com</a>.</p>
          </div>

          <div>
            <h2 className="font-display text-xl font-bold text-ink">5. Contato</h2>
            <p>Dúvidas sobre esta política? Fale com a gente em
              <a href="mailto:contato@naplanta.com" className="text-brand"> contato@naplanta.com</a>.</p>
          </div>
        </div>
      </section>
    </>
  );
}
