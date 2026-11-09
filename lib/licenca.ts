import { createHash } from 'crypto';
import { sb } from './supabase';

export type Maquina = {
  id: string;
  cliente_id: string;
  apelido: string;
  modelo: string;
  status: string;
  vencimento: string;
  tablet_id: string | null;
  nome_exibicao: string;
  cor_primaria: string;
  cor_secundaria: string;
  logo_url: string | null;
  versao_minima: number;
  apk_url: string | null;
};

export const DIAS_TOLERANCIA = 3;

export type Situacao = 'ativa' | 'tolerancia' | 'bloqueada';

export type ResultadoSituacao = {
  situacao: Situacao;
  diasAtraso: number;
  diasToleranciaRestantes: number;
};

export function calcularSituacao(m: Pick<Maquina, 'status' | 'vencimento'>): ResultadoSituacao {
  if (m.status !== 'ativa') {
    return { situacao: 'bloqueada', diasAtraso: 0, diasToleranciaRestantes: 0 };
  }

  const hoje = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  const diasAtraso = Math.floor((Date.parse(hoje) - Date.parse(m.vencimento)) / 86400000);

  if (diasAtraso <= 0) {
    return { situacao: 'ativa', diasAtraso: 0, diasToleranciaRestantes: DIAS_TOLERANCIA };
  }
  if (diasAtraso <= DIAS_TOLERANCIA) {
    return {
      situacao: 'tolerancia',
      diasAtraso,
      diasToleranciaRestantes: DIAS_TOLERANCIA - diasAtraso,
    };
  }
  return { situacao: 'bloqueada', diasAtraso, diasToleranciaRestantes: 0 };
}

export function hashLicenca(chave: string): string {
  return createHash('sha256').update(chave.trim().toUpperCase()).digest('hex');
}

export type Autenticacao =
  | { ok: true; maquina: Maquina }
  | { ok: false; status: number; erro: string };

export async function autenticar(
  req: Request,
  opcoes: { permitirVincular?: boolean } = {}
): Promise<Autenticacao> {
  const chave = req.headers.get('x-licenca');
  const tablet = req.headers.get('x-tablet');
  if (!chave || !tablet) {
    return { ok: false, status: 401, erro: 'credenciais_ausentes' };
  }

  const linhas = await sb<Maquina[]>(`maquinas?licenca_hash=eq.${hashLicenca(chave)}&select=*`);
  const maquina = linhas[0];
  if (!maquina) {
    return { ok: false, status: 401, erro: 'licenca_invalida' };
  }

  if (maquina.tablet_id && maquina.tablet_id !== tablet) {
    return { ok: false, status: 403, erro: 'licenca_em_outro_tablet' };
  }

  if (!maquina.tablet_id) {
    if (!opcoes.permitirVincular) {
      return { ok: false, status: 403, erro: 'maquina_nao_ativada' };
    }
    await sb(`maquinas?id=eq.${maquina.id}`, {
      method: 'PATCH',
      body: { tablet_id: tablet },
      prefer: 'return=minimal',
    });
    maquina.tablet_id = tablet;
  }

  return { ok: true, maquina };
}