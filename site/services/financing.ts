import { apiGet } from "./api";
import type { BancosResponse } from "@/types/financing";

/** Tabela de bancos + taxas (fonte de verdade no back office). */
export function getBancos(revalidate = 3600): Promise<BancosResponse> {
  return apiGet<BancosResponse>("financing.php", { revalidate });
}
