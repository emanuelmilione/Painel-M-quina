import { NextResponse } from 'next/server';
import { autenticar } from '@/lib/licenca';
import { montarConfig } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const auth = await autenticar(req, { permitirVincular: true });
    if (!auth.ok) return NextResponse.json({ erro: auth.erro }, { status: auth.status });
    return NextResponse.json(await montarConfig(auth.maquina));
  } catch {
    return NextResponse.json({ erro: 'erro_interno' }, { status: 500 });
  }
}