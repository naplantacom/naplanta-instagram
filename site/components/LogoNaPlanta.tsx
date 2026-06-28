import Image from "next/image";

export function LogoNaPlanta() {
  return (
    <span className="logo-wrap">
      <Image
        src="/logo-naplanta.png"
        alt="NaPlanta Imobiliária"
        width={142}
        height={46}
        priority
        className="logo-pulse"
      />
    </span>
  );
}
