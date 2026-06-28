export interface Post {
  id: number;
  slug: string;
  titulo: string;
  resumo: string;
  conteudo: string;
  categoria: string;
  data: string; // ISO YYYY-MM-DD
  capa: string | null;
  url: string; // externo (http) ou interno (/...) — vazio = /blog/<slug>
}

export interface PostsResponse {
  total: number;
  posts: Post[];
}
