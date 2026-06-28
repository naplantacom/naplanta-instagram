import type { Metadata } from "next";
import { FinancingSimulator } from "@/components/FinancingSimulator";
import { getBancos } from "@/services/financing";
import type { Banco } from "@/types/financing";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Simulador de financiamento",
  description:
    "Simule o financiamento do seu imóvel e compare as parcelas entre Caixa, Banco do Brasil, Itaú, Bradesco e Santander.",
};

export default async function FinanciamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ valor?: string }>;
}) {
  const { valor } = await searchParams;
  const valorInicial = valor && Number(valor) > 0 ? Number(valor) : 500000;

  let bancos: Banco[] = [];
  try {
    bancos = (await getBancos()).bancos;
  } catch {
    // API indisponível — página ainda renderiza com aviso.
  }

  return (
    <>
      <section className="border-b border-black/5 bg-neutral-50">
        <div className="container py-12">
          <h1 className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
            Simulador de financiamento
          </h1>
          <p className="mt-2 max-w-2xl text-ink-muted">
            Ajuste o valor, a entrada e o prazo e compare as parcelas entre os principais bancos.
            Atendimento da NaPlanta pra te ajudar do crédito às chaves.
          </p>
        </div>
      </section>

      <section className="container py-10">
        {bancos.length > 0 ? (
          <FinancingSimulator bancos={bancos} valorInicial={valorInicial} />
        ) : (
          <p className="rounded-2xl bg-neutral-50 p-10 text-center text-ink-muted">
            Simulador indisponível no momento. Tente novamente em instantes.
          </p>
        )}
      </section>
    </>
  );
}
