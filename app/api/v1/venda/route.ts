import { NextResponse } from 'next/server';
import { autenticar } from '@/lib/licenca';
import { sb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const STATUS_VALIDOS = [
  'iniciado',
  'concluido',
  'estornado',
  'erro_estorno',
  'cancelado_sem_reembolso',
  'erro_cortesia',
  'expirado',
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  try {
    // Não bloqueia por licença vencida: o resultado de uma venda já em andamento precisa ser gravado.
    const auth = await autenticar(req);
    if (!auth.ok) return NextResponse.json({ erro: auth.erro }, { status: auth.status });
    const m = auth.maquina;

    const corpo = await req.json().catch(() => null);
    if (!corpo || typeof corpo !== 'object') {
      return NextResponse.json({ erro: 'corpo_invalido' }, { status: 400 });
    }
    if (typeof corpo.venda_uid !== 'string' || !UUID.test(corpo.venda_uid)) {
      return NextResponse.json({ erro: 'venda_uid_invalido' }, { status: 400 });
    }
    if (!STATUS_VALIDOS.includes(corpo.status)) {
      return NextResponse.json({ erro: 'status_invalido' }, { status: 400 });
    }
    if (!Number.isInteger(corpo.valor_centavos) || corpo.valor_centavos < 0 || corpo.valor_centavos > 100000000) {
      return NextResponse.json({ erro: 'valor_invalido' }, { status: 400 });
    }
    if (typeof corpo.plano !== 'string' || corpo.plano.length === 0) {
      return NextResponse.json({ erro: 'plano_invalido' }, { status: 400 });
    }

    const linha: Record<string, unknown> = {
      maquina_id: m.id,
      cliente_id: m.cliente_id,
      maquina: m.apelido,
      venda_uid: corpo.venda_uid,
      plano: corpo.plano.slice(0, 60),
      valor_centavos: corpo.valor_centavos,
      status: corpo.status,
      payment_id: Number.isInteger(corpo.payment_id) ? corpo.payment_id : null,
      detalhe: corpo.detalhe ? String(corpo.detalhe).slice(0, 300) : null,
      cupom: corpo.cupom ? String(corpo.cupom).slice(0, 40) : null,
      slot: Number.isInteger(corpo.slot) ? corpo.slot : null,
    };

    // Campos vazios ficam de fora, pra uma atualização não apagar o que já estava gravado.
    const limpa = Object.fromEntries(
      Object.entries(linha).filter(([, v]) => v !== null && v !== undefined)
    );

    await sb('vendas?on_conflict=maquina_id,venda_uid', {
      method: 'POST',
      body: limpa,
      prefer: 'resolution=merge-duplicates,return=minimal',
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ erro: 'erro_interno' }, { status: 500 });
  }
}