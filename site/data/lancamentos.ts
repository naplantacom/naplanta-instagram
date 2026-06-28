export interface Empreendimento {
  slug: string;
  nome: string;
  local: string;
  status: string;
  precoDe: string;
  resumo: string;
  tipologias: string;
  cover: string;
  /** Link da landing page do empreendimento (vazio = só WhatsApp por enquanto). */
  url: string;
}

export const EMPREENDIMENTOS: Empreendimento[] = [
  {
    slug: "inhaus",
    nome: "InHaus",
    local: "Grande Florianópolis · SC",
    status: "Lançamento",
    precoDe: "A partir de R$ 797.000",
    resumo: "Apartamentos de 2 e 3 dormitórios com lazer completo e acabamento premium.",
    tipologias: "2 e 3 dorm · 68 a 115 m²",
    cover: "/lancamentos/inhaus.jpg",
    url: "",
  },
  {
    slug: "next-trindade",
    nome: "Next Trindade",
    local: "Trindade, Florianópolis · SC",
    status: "Lançamento",
    precoDe: "A partir de R$ 363.216",
    resumo: "Studios, lofts e 2 dormitórios no coração da Trindade, pertinho da UFSC.",
    tipologias: "Studios, lofts e 2 dorm · 31 a 71 m²",
    cover: "/lancamentos/next-trindade.jpg",
    url: "",
  },
  {
    slug: "belleville",
    nome: "Belle Ville Residence",
    local: "Campinas, São José · SC",
    status: "Lançamento",
    precoDe: "A partir de R$ 724.507",
    resumo: "Apartamentos de 66 a 112 m² com piscina rooftop, fitness e acabamento premium.",
    tipologias: "66 a 112 m² · 1 a 3 suítes",
    cover: "/lancamentos/belleville.jpg",
    url: "",
  },
  {
    slug: "valence",
    nome: "Valence Residence",
    local: "Vivapark, Porto Belo · SC",
    status: "Breve lançamento",
    precoDe: "Consulte condições",
    resumo: "Primeiro empreendimento RDO no Vivapark, o bairro planejado de Porto Belo.",
    tipologias: "2 a 4 suítes · 73 a 145 m²",
    cover: "/lancamentos/valence.jpg",
    url: "",
  },
];
