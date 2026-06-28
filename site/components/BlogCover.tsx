// Capas temáticas do blog (SVG nítido, identidade NaPlanta).
// Usado como capa quando o artigo não tem imagem própria (p.capa).

type Props = { categoria?: string; titulo?: string; className?: string };

function norm(s?: string): string {
  return (s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const RED = "#E60000";

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 400 225" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="bgInk" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#141414" />
          <stop offset="1" stopColor="#1f0606" />
        </linearGradient>
        <linearGradient id="redFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={RED} stopOpacity="0.9" />
          <stop offset="1" stopColor={RED} stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect width="400" height="225" fill="url(#bgInk)" />
      {/* brilho diagonal sutil */}
      <circle cx="330" cy="40" r="120" fill={RED} opacity="0.10" />
      {children}
    </svg>
  );
}

function Mercado() {
  // Skyline urbano + seta de alta
  return (
    <Scene>
      <g opacity="0.18" stroke="#fff" strokeWidth="1">
        {[40, 90, 140, 190, 240, 290, 340].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="225" />
        ))}
      </g>
      <g fill="#fff" opacity="0.85">
        <rect x="40" y="150" width="34" height="60" />
        <rect x="84" y="120" width="34" height="90" />
        <rect x="128" y="95" width="34" height="115" />
        <rect x="172" y="130" width="34" height="80" />
      </g>
      <g fill="url(#redFade)">
        <rect x="216" y="80" width="34" height="130" />
        <rect x="260" y="55" width="34" height="155" />
        <rect x="304" y="100" width="34" height="110" />
      </g>
      {/* janelinhas */}
      <g fill="#141414" opacity="0.5">
        {[50, 94, 138, 182, 226, 270, 314].map((x) =>
          [165, 185].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="6" height="6" />)
        )}
      </g>
      <path d="M250 70 L300 40 L300 58 L340 58" stroke={RED} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M300 40 L286 46 L304 54 Z" fill={RED} />
    </Scene>
  );
}

function Tendencias() {
  // Linha de tendência ascendente com pontos
  const pts = "30,180 90,150 140,165 200,110 260,125 330,55";
  const dots = [
    [30, 180], [90, 150], [140, 165], [200, 110], [260, 125], [330, 55],
  ];
  return (
    <Scene>
      <g stroke="#fff" strokeWidth="1" opacity="0.12">
        {[60, 105, 150, 195].map((y) => (
          <line key={y} x1="20" y1={y} x2="380" y2={y} />
        ))}
      </g>
      <polyline points={`${pts} 330,205 30,205`} fill="url(#redFade)" opacity="0.5" stroke="none" />
      <polyline points={pts} fill="none" stroke={RED} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill="#fff" stroke={RED} strokeWidth="2.5" />
      ))}
      <path d="M330 55 L314 60 L332 70 Z" fill={RED} />
    </Scene>
  );
}

function Financiamento() {
  // Casa + selo de porcentagem + moedas
  return (
    <Scene>
      <g transform="translate(70,55)">
        <path d="M0 70 L70 15 L140 70 Z" fill="url(#redFade)" />
        <rect x="18" y="70" width="104" height="78" fill="#fff" opacity="0.9" />
        <rect x="55" y="105" width="30" height="43" fill="#141414" opacity="0.55" />
        <rect x="30" y="85" width="22" height="20" fill="#141414" opacity="0.3" />
        <rect x="88" y="85" width="22" height="20" fill="#141414" opacity="0.3" />
      </g>
      <g transform="translate(265,120)">
        {[0, 14, 28].map((dy, i) => (
          <ellipse key={i} cx="0" cy={50 - dy} rx="34" ry="11" fill="#fff" opacity={0.55 + i * 0.12} />
        ))}
        <text x="0" y="30" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="22" fill={RED}>R$</text>
      </g>
      <g transform="translate(255,38)">
        <circle r="30" fill={RED} />
        <text x="0" y="9" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="26" fill="#fff">%</text>
      </g>
    </Scene>
  );
}

function Guia() {
  // Prancheta com checklist
  return (
    <Scene>
      <g transform="translate(120,38)">
        <rect x="0" y="10" width="160" height="160" rx="12" fill="#fff" opacity="0.95" />
        <rect x="55" y="0" width="50" height="22" rx="6" fill={RED} />
        {[40, 78, 116].map((y, i) => (
          <g key={y}>
            <rect x="22" y={y} width="22" height="22" rx="5" fill="none" stroke={RED} strokeWidth="3" />
            <path d={`M26 ${y + 12} l5 6 l9 -12`} fill="none" stroke={RED} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="56" y={y + 6} width={i === 1 ? 70 : 86} height="9" rx="4.5" fill="#141414" opacity="0.25" />
          </g>
        ))}
      </g>
    </Scene>
  );
}

function Investimento() {
  // Barras crescentes + moeda
  return (
    <Scene>
      <g transform="translate(50,40)">
        {[
          [0, 110, 50],
          [60, 80, 80],
          [120, 50, 110],
        ].map(([x, y, h], i) => (
          <rect key={i} x={x} y={y} width="44" height={h} rx="6" fill={i === 2 ? "url(#redFade)" : "#fff"} opacity={i === 2 ? 1 : 0.85} />
        ))}
        <path d="M10 70 L70 45 L130 20" stroke={RED} strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M130 20 L114 24 L122 36 Z" fill={RED} />
      </g>
      <g transform="translate(300,120)">
        <circle r="38" fill={RED} />
        <circle r="30" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.8" />
        <text x="0" y="13" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="32" fill="#fff">$</text>
      </g>
    </Scene>
  );
}

function Casa() {
  // Default — casa com chave
  return (
    <Scene>
      <g transform="translate(110,45)">
        <path d="M0 75 L80 12 L160 75 Z" fill="url(#redFade)" />
        <rect x="20" y="75" width="120" height="85" fill="#fff" opacity="0.92" />
        <rect x="62" y="110" width="36" height="50" fill="#141414" opacity="0.55" />
        <circle cx="90" cy="135" r="3.5" fill={RED} />
        <rect x="34" y="92" width="26" height="22" fill="#141414" opacity="0.3" />
        <rect x="100" y="92" width="26" height="22" fill="#141414" opacity="0.3" />
      </g>
    </Scene>
  );
}

function Comparativo() {
  // Balança da decisão em estilo 3D moderno — comprar (casa) x alugar (dinheiro)
  return (
    <svg viewBox="0 0 400 225" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="cmpBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#231a2c" />
          <stop offset="1" stopColor="#0b0b0f" />
        </linearGradient>
        <radialGradient id="cmpGlow" cx="0.5" cy="0.32" r="0.7">
          <stop offset="0" stopColor="#ff2d2d" stopOpacity="0.5" />
          <stop offset="1" stopColor="#e60000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cmpRoof" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ff5757" />
          <stop offset="1" stopColor="#a30000" />
        </linearGradient>
        <linearGradient id="cmpWallA" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#d6d6d6" />
        </linearGradient>
        <linearGradient id="cmpWallB" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4c4c4" />
          <stop offset="1" stopColor="#8f8f8f" />
        </linearGradient>
        <linearGradient id="cmpCoinTop" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff6a6a" />
          <stop offset="1" stopColor="#cc0000" />
        </linearGradient>
        <linearGradient id="cmpCoinSide" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c00000" />
          <stop offset="1" stopColor="#6e0000" />
        </linearGradient>
        <linearGradient id="cmpMetal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset="1" stopColor="#aeb3b8" />
        </linearGradient>
        <linearGradient id="cmpTray" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a5364" />
          <stop offset="1" stopColor="#2a2533" />
        </linearGradient>
        <radialGradient id="cmpPivot" cx="0.35" cy="0.3" r="0.85">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#aeb3b8" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="400" height="225" fill="url(#cmpBg)" />
      <circle cx="200" cy="60" r="180" fill="url(#cmpGlow)" />
      <g stroke="#fff" strokeWidth="1" opacity="0.04">
        <line x1="0" y1="192" x2="400" y2="192" />
        <line x1="0" y1="204" x2="400" y2="204" />
        <line x1="0" y1="216" x2="400" y2="216" />
      </g>

      {/* pedestal */}
      <ellipse cx="200" cy="206" rx="46" ry="6" fill="#000" opacity="0.35" />
      <rect x="170" y="192" width="60" height="14" rx="7" fill="#15121b" />
      <rect x="170" y="188" width="60" height="12" rx="6" fill="url(#cmpTray)" />
      <rect x="196" y="60" width="8" height="130" rx="4" fill="url(#cmpMetal)" />
      <rect x="197" y="60" width="2" height="130" rx="1" fill="#fff" opacity="0.5" />

      {/* cabos */}
      <g stroke="url(#cmpMetal)" strokeWidth="2" opacity="0.8" strokeLinecap="round">
        <path d="M96 73 L76 111" />
        <path d="M96 73 L124 111" />
        <path d="M304 47 L280 91" />
        <path d="M304 47 L328 91" />
      </g>

      {/* braço inclinado */}
      <g transform="rotate(-7 200 60)">
        <rect x="92" y="55" width="216" height="10" rx="5" fill="url(#cmpMetal)" />
        <rect x="92" y="56" width="216" height="2.5" rx="1" fill="#fff" opacity="0.55" />
        <rect x="92" y="63" width="216" height="2" rx="1" fill="#000" opacity="0.15" />
        <circle cx="95" cy="60" r="5" fill="url(#cmpMetal)" />
        <circle cx="305" cy="60" r="5" fill="url(#cmpMetal)" />
      </g>
      <circle cx="200" cy="60" r="8" fill="url(#cmpPivot)" />
      <circle cx="200" cy="60" r="3" fill={RED} />

      {/* bandeja esquerda + casa 3D (comprar) */}
      <rect x="70" y="116" width="60" height="12" rx="6" fill="#15121b" />
      <rect x="70" y="110" width="60" height="12" rx="6" fill="url(#cmpTray)" />
      <rect x="74" y="111" width="52" height="2.5" rx="1" fill="#fff" opacity="0.2" />
      <g>
        <polygon points="113,80 124,73 124,103 113,110" fill="url(#cmpWallB)" />
        <rect x="85" y="80" width="28" height="30" fill="url(#cmpWallA)" />
        <polygon points="118,81 99,63 110,56 129,74" fill="#9e0000" />
        <polygon points="80,81 99,63 118,81" fill="url(#cmpRoof)" />
        <rect x="94" y="92" width="11" height="18" rx="1" fill="#2a2230" />
        <circle cx="102" cy="101" r="1.2" fill={RED} />
        <rect x="88" y="86" width="8" height="8" rx="1" fill="#cfe8ff" opacity="0.85" />
      </g>

      {/* bandeja direita + moedas 3D (alugar) */}
      <rect x="274" y="104" width="60" height="12" rx="6" fill="#15121b" />
      <rect x="274" y="98" width="60" height="12" rx="6" fill="url(#cmpTray)" />
      <rect x="278" y="99" width="52" height="2.5" rx="1" fill="#fff" opacity="0.2" />
      <g>
        <path d="M284 70 L284 92 A20 6 0 0 0 324 92 L324 70" fill="url(#cmpCoinSide)" />
        <path d="M284 78 A20 6 0 0 0 324 78" stroke="#4d0000" strokeWidth="1" fill="none" opacity="0.6" />
        <path d="M284 85 A20 6 0 0 0 324 85" stroke="#4d0000" strokeWidth="1" fill="none" opacity="0.6" />
        <ellipse cx="304" cy="70" rx="20" ry="6" fill="url(#cmpCoinTop)" />
        <text x="304" y="74" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="11" fill="#fff">R$</text>
      </g>

      {/* rótulos modernos */}
      <rect x="72" y="146" width="56" height="20" rx="10" fill="#ffffff" opacity="0.1" />
      <text x="100" y="160" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12" fill="#fff">Comprar</text>
      <rect x="276" y="146" width="56" height="20" rx="10" fill="#ffffff" opacity="0.1" />
      <text x="304" y="160" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="12" fill="#fff">Alugar</text>
    </svg>
  );
}

export function BlogCover({ categoria, titulo, className }: Props) {
  const c = norm(categoria);
  const t = norm(titulo);
  let Art = Casa;
  if (c.includes("merc")) Art = Mercado;
  else if (c.includes("tend")) Art = Tendencias;
  else if (c.includes("financ")) Art = Financiamento;
  else if (c.includes("guia") || c.includes("doc")) Art = Guia;
  else if (c.includes("invest")) Art = Investimento;

  // Comparativos (ex.: "alugar ou comprar") ganham arte própria, mesmo sendo categoria "Guia".
  if (
    t.includes("comparativ") ||
    t.includes("alugar ou comprar") ||
    t.includes("comprar ou alugar") ||
    (t.includes("alugar") && t.includes("comprar"))
  ) {
    Art = Comparativo;
  }

  return (
    <div className={className}>
      <Art />
    </div>
  );
}
