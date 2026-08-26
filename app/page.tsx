import PainelInterativo from '@/components/PainelInterativo';

type Venda = {
  id: number;
  criado_em: string;
  plano: string;
  valor_centavos: number;
  status: string;
  payment_id: number | null;
  detalhe: string | null;
  cupom: string | null;
};

async function buscarVendas(): Promise<Venda[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel.'
    );
  }

  const resposta = await fetch(`${url}/rest/v1/vendas?select=*&order=criado_em.asc`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    cache: 'no-store',
  });

  if (!resposta.ok) {
    throw new Error(`Erro ao buscar vendas: ${resposta.status}`);
  }

  return resposta.json();
}

export default async function PaginaInicial() {
  const vendas = await buscarVendas();
  return <PainelInterativo vendas={vendas} />;
}