type Venda = {
  id: number;
  criado_em: string;
  plano: string;
  valor_centavos: number;
  status: string;
  payment_id: number | null;
  detalhe: string | null;
};

async function buscarVendas(): Promise<Venda[]> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY nas variáveis de ambiente da Vercel.'
    );
  }

  const resposta = await fetch(`${url}/rest/v1/vendas?select=*&order=criado_em.desc`, {
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

function formatarReais(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

const corPorStatus: Record<string, string> = {
  concluido: '#22C7E8',
  estornado: '#F0A22E',
  expirado: '#8A93A6',
  erro_estorno: '#E5484D',
};

const textoPorStatus: Record<string, string> = {
  concluido: 'Concluído',
  estornado: 'Estornado',
  expirado: 'Expirado',
  erro_estorno: 'Erro no estorno',
};

export default async function PaginaInicial() {
  const vendas = await buscarVendas();

  const concluidas = vendas.filter((v) => v.status === 'concluido');
  const totalArrecadado = concluidas.reduce((soma, v) => soma + v.valor_centavos, 0);
  const totalCiclos = concluidas.length;
  const totalExpirados = vendas.filter((v) => v.status === 'expirado').length;

  return (
    <main style={{ padding: '32px', maxWidth: '960px', margin: '0 auto', color: '#FFFFFF' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
        KAPA — Painel de Vendas
      </h1>
      <p style={{ color: '#8A93A6', marginBottom: '32px' }}>Higienização de Capacete</p>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        <CartaoResumo titulo="Total arrecadado" valor={formatarReais(totalArrecadado)} />
        <CartaoResumo titulo="Ciclos concluídos" valor={String(totalCiclos)} />
        <CartaoResumo titulo="Pix expirados (sem pagar)" valor={String(totalExpirados)} />
      </div>

      <div
        style={{
          backgroundColor: '#12151C',
          border: '1px solid #232733',
          borderRadius: '16px',
          overflow: 'hidden',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#171B24', textAlign: 'left' }}>
              <Th>Data/hora</Th>
              <Th>Plano</Th>
              <Th>Valor</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {vendas.map((venda) => (
              <tr key={venda.id} style={{ borderTop: '1px solid #232733' }}>
                <Td>{formatarData(venda.criado_em)}</Td>
                <Td>{venda.plano}</Td>
                <Td>{formatarReais(venda.valor_centavos)}</Td>
                <Td>
                  <span
                    style={{
                      color: corPorStatus[venda.status] ?? '#8A93A6',
                      fontWeight: 600,
                    }}
                  >
                    {textoPorStatus[venda.status] ?? venda.status}
                  </span>
                </Td>
              </tr>
            ))}
            {vendas.length === 0 && (
              <tr>
                <Td colSpan={4}>Nenhuma venda registrada ainda.</Td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function CartaoResumo({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div
      style={{
        backgroundColor: '#12151C',
        border: '1px solid #232733',
        borderRadius: '16px',
        padding: '20px',
        flex: '1',
        minWidth: '200px',
      }}
    >
      <p style={{ color: '#8A93A6', fontSize: '14px', marginBottom: '8px' }}>{titulo}</p>
      <p style={{ color: '#22C7E8', fontSize: '26px', fontWeight: 'bold', margin: 0 }}>{valor}</p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '14px 16px', color: '#8A93A6', fontSize: '13px', textTransform: 'uppercase' }}>
      {children}
    </th>
  );
}

function Td({ children, colSpan }: { children: React.ReactNode; colSpan?: number }) {
  return (
    <td colSpan={colSpan} style={{ padding: '14px 16px', fontSize: '14px' }}>
      {children}
    </td>
  );
}
