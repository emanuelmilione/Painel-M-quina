const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Opcoes = {
  method?: string;
  body?: unknown;
  prefer?: string;
};

export async function sb<T = unknown>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas.');
  }

  const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
    method: opcoes.method ?? 'GET',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(opcoes.prefer ? { Prefer: opcoes.prefer } : {}),
    },
    body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
    cache: 'no-store',
  });

  if (!resposta.ok) {
    throw new Error(`Supabase ${resposta.status}: ${await resposta.text()}`);
  }

  const texto = await resposta.text();
  return (texto ? JSON.parse(texto) : null) as T;
}