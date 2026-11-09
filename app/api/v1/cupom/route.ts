import { NextResponse } from 'next/server';
import { autenticar, calcularSituacao } from '@/lib/licenca';
import { sb } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await autenticar(req);
    if (!auth.ok) return NextResponse.json({ erro: auth.erro }, { status: auth.status });

    if (calcularSituacao(auth.maquina).situacao === 'bloqueada') {
      return NextResponse.json({ erro: 'licenca_bloqueada' }, { status: 403 });
    }

    const corpo = await req.json().catch(() => ({}));
    const codigo = String(corpo?.codigo ?? '').trim().toLowerCase();

    // Só letras, números e hífen: nada de curinga nem caractere estranho na consulta.
    if (!/^[a-z0-9-]{1,40}$/.test(codigo)) {
      return NextResponse.json({ erro: 'cupom_invalido' }, { status: 404 });
    }

    const linhas = await sb<{ codigo: string; desconto_percentual: number }[]>(
      `cupons?cliente_id=eq.${auth.maquina.cliente_id}&codigo_norm=eq.${codigo}&ativo=eq.true&select=codigo,desconto_percentual&limit=1`
    );

    if (!linhas[0]) return NextResponse.json({ erro: 'cupom_invalido' }, { status: 404 });
    return NextResponse.json(linhas[0]);
  } catch {
    return NextResponse.json({ erro: 'erro_interno' }, { status: 500 });
  }
}