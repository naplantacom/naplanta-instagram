/**
 * Configuração pública do site (flags globais geridas no módulo Portais → Extras).
 * Endpoint: GET /api/v1/config.php
 */
import { apiGet } from "./api";

export interface SiteConfig {
  /** Modo Copa: botão flutuante vira bola e comemora gol a cada 10s. */
  modo_copa: boolean;
}

export async function getSiteConfig(revalidate = 60): Promise<SiteConfig> {
  try {
    const d = await apiGet<Partial<SiteConfig>>("config.php", { revalidate });
    return { modo_copa: !!d?.modo_copa };
  } catch {
    // Fallback seguro: se a API falhar, o botão fica no modo normal.
    return { modo_copa: false };
  }
}
