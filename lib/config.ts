import { sb } from './supabase';
import { calcularSituacao, Maquina } from './licenca';

type PlanoLinha = {
  codigo: string;
  nome: string;
  preco_centavos: number;
  ordem: number;
};

export async function montarConfig(m: Maquina) {
  const planos = await sb<PlanoLinha[]>(
    `planos?maquina_id=eq.${m.id}&ativo=eq.true&select=codigo,nome,preco_centavos,ordem&order=ordem.asc`
  );

  await sb(`maquinas?id=eq.${m.id}`, {
    method: 'PATCH',
    body: { ultimo_sinal: new Date().toISOString() },
    prefer: 'return=minimal',
  });

  const lic = calcularSituacao(m);

  return {
    maquina: { id: m.id, apelido: m.apelido, modelo: m.modelo },
    licenca: {
      situacao: lic.situacao,
      vencimento: m.vencimento,
      dias_atraso: lic.diasAtraso,
      dias_tolerancia_restantes: lic.diasToleranciaRestantes,
    },
    marca: {
      nome: m.nome_exibicao,
      cor_primaria: m.cor_primaria,
      cor_secundaria: m.cor_secundaria,
      logo_url: m.logo_url,
    },
    planos,
    app: { versao_minima: m.versao_minima, apk_url: m.apk_url },
  };
}