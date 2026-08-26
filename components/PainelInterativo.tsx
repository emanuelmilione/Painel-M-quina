"use client";

import { useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

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

type Periodo = "hoje" | "semana" | "mes" | "tudo" | "custom";

const cores = {
  background: "#0B0D12",
  card: "#12151C",
  border: "#232733",
  textPrimary: "#FFFFFF",
  textSecondary: "#8A93A6",
  accent: "#22C7E8",
};

function formatarReais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatarDataCurta(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function PainelInterativo({ vendas }: { vendas: Venda[] }) {
  const [periodo, setPeriodo] = useState<Periodo>("tudo");
  const [dataInicioCustom, setDataInicioCustom] = useState("");
  const [dataFimCustom, setDataFimCustom] = useState("");

  const vendasFiltradas = useMemo(() => {
    if (periodo === "tudo") return vendas;

    const agora = new Date();
    let inicio: Date;
    let fim: Date = agora;

    if (periodo === "hoje") {
      inicio = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
    } else if (periodo === "semana") {
      inicio = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (periodo === "mes") {
      inicio = new Date(agora.getFullYear(), agora.getMonth(), 1);
    } else {
      if (!dataInicioCustom || !dataFimCustom) return vendas;
      inicio = new Date(dataInicioCustom + "T00:00:00");
      fim = new Date(dataFimCustom + "T23:59:59");
    }

    return vendas.filter((v) => {
      const dataVenda = new Date(v.criado_em);
      return dataVenda >= inicio && dataVenda <= fim;
    });
  }, [vendas, periodo, dataInicioCustom, dataFimCustom]);

  const resumo = useMemo(() => {
    const concluidas = vendasFiltradas.filter((v) => v.status === "concluido");
    const expiradas = vendasFiltradas.filter((v) => v.status === "expirado");
    const faturamentoCentavos = concluidas.reduce((soma, v) => soma + v.valor_centavos, 0);
    return {
      faturamentoCentavos,
      ciclosConcluidos: concluidas.length,
      expirados: expiradas.length,
      total: vendasFiltradas.length,
    };
  }, [vendasFiltradas]);

  const dadosFaturamentoPorDia = useMemo(() => {
    const mapa = new Map<string, number>();
    vendasFiltradas
      .filter((v) => v.status === "concluido")
      .forEach((v) => {
        const chave = formatarDataCurta(v.criado_em);
        mapa.set(chave, (mapa.get(chave) ?? 0) + v.valor_centavos / 100);
      });
    return Array.from(mapa.entries()).map(([data, valor]) => ({ data, valor }));
  }, [vendasFiltradas]);

  const dadosPorPlano = useMemo(() => {
    const mapa = new Map<string, number>();
    vendasFiltradas
      .filter((v) => v.status === "concluido")
      .forEach((v) => {
        mapa.set(v.plano, (mapa.get(v.plano) ?? 0) + 1);
      });
    return Array.from(mapa.entries()).map(([plano, quantidade]) => ({ plano, quantidade }));
  }, [vendasFiltradas]);

  const dadosPorCupom = useMemo(() => {
    const mapa = new Map<string, number>();
    vendasFiltradas
      .filter((v) => v.cupom)
      .forEach((v) => {
        const codigo = v.cupom as string;
        mapa.set(codigo, (mapa.get(codigo) ?? 0) + 1);
      });
    return Array.from(mapa.entries()).map(([cupom, usos]) => ({ cupom, usos }));
  }, [vendasFiltradas]);

  return (
    <main style={{ minHeight: "100vh", background: cores.background, padding: "32px 24px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ color: cores.textPrimary, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>
          KAPA — Painel de Vendas
        </h1>
        <p style={{ color: cores.textSecondary, marginBottom: 28 }}>Higienização de Capacete</p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28, alignItems: "center" }}>
          {(["hoje", "semana", "mes", "tudo"] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              style={{
                padding: "8px 16px",
                borderRadius: 20,
                border: `1px solid ${cores.border}`,
                background: periodo === p ? cores.accent : cores.card,
                color: periodo === p ? "#0B0D12" : cores.textPrimary,
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {p === "hoje" ? "Hoje" : p === "semana" ? "Últimos 7 dias" : p === "mes" ? "Este mês" : "Tudo"}
            </button>
          ))}

          <span style={{ color: cores.textSecondary, marginLeft: 8, marginRight: 4 }}>ou</span>

          <input
            type="date"
            value={dataInicioCustom}
            onChange={(e) => {
              setDataInicioCustom(e.target.value);
              setPeriodo("custom");
            }}
            style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${cores.border}`, background: cores.card, color: cores.textPrimary }}
          />
          <span style={{ color: cores.textSecondary }}>até</span>
          <input
            type="date"
            value={dataFimCustom}
            onChange={(e) => {
              setDataFimCustom(e.target.value);
              setPeriodo("custom");
            }}
            style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${cores.border}`, background: cores.card, color: cores.textPrimary }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          <CardResumo titulo="Faturamento" valor={formatarReais(resumo.faturamentoCentavos)} />
          <CardResumo titulo="Ciclos concluídos" valor={String(resumo.ciclosConcluidos)} />
          <CardResumo titulo="Pix expirados" valor={String(resumo.expirados)} />
          <CardResumo titulo="Total de eventos" valor={String(resumo.total)} />
        </div>

        <Cartao titulo="Faturamento ao longo do tempo">
          {dadosFaturamentoPorDia.length === 0 ? (
            <SemDados />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dadosFaturamentoPorDia}>
                <CartesianGrid stroke={cores.border} strokeDasharray="3 3" />
                <XAxis dataKey="data" stroke={cores.textSecondary} fontSize={12} />
                <YAxis stroke={cores.textSecondary} fontSize={12} tickFormatter={(v) => `R$${v}`} />
                <Tooltip
                  contentStyle={{ background: cores.card, border: `1px solid ${cores.border}`, borderRadius: 8 }}
                  labelStyle={{ color: cores.textPrimary }}
                  formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Faturamento"]}
                />
                <Line type="monotone" dataKey="valor" stroke={cores.accent} strokeWidth={2} dot={{ fill: cores.accent }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Cartao>

        <Cartao titulo="Vendas por plano">
          {dadosPorPlano.length === 0 ? (
            <SemDados />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dadosPorPlano}>
                <CartesianGrid stroke={cores.border} strokeDasharray="3 3" />
                <XAxis dataKey="plano" stroke={cores.textSecondary} fontSize={12} />
                <YAxis stroke={cores.textSecondary} fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: cores.card, border: `1px solid ${cores.border}`, borderRadius: 8 }}
                  labelStyle={{ color: cores.textPrimary }}
                />
                <Bar dataKey="quantidade" fill={cores.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Cartao>

        <Cartao titulo="Uso de cupons">
          {dadosPorCupom.length === 0 ? (
            <SemDados texto="Nenhum cupom usado nesse período" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dadosPorCupom}>
                <CartesianGrid stroke={cores.border} strokeDasharray="3 3" />
                <XAxis dataKey="cupom" stroke={cores.textSecondary} fontSize={12} />
                <YAxis stroke={cores.textSecondary} fontSize={12} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: cores.card, border: `1px solid ${cores.border}`, borderRadius: 8 }}
                  labelStyle={{ color: cores.textPrimary }}
                />
                <Bar dataKey="usos" fill={cores.accent} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Cartao>
      </div>
    </main>
  );
}

function CardResumo({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div style={{ background: cores.card, border: `1px solid ${cores.border}`, borderRadius: 16, padding: 20 }}>
      <p style={{ color: cores.textSecondary, fontSize: 13, marginBottom: 6 }}>{titulo}</p>
      <p style={{ color: cores.textPrimary, fontSize: 26, fontWeight: 700 }}>{valor}</p>
    </div>
  );
}

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div style={{ background: cores.card, border: `1px solid ${cores.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
      <h2 style={{ color: cores.textPrimary, fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{titulo}</h2>
      {children}
    </div>
  );
}

function SemDados({ texto = "Sem dados nesse período" }: { texto?: string }) {
  return <p style={{ color: cores.textSecondary, textAlign: "center", padding: "40px 0" }}>{texto}</p>;
}