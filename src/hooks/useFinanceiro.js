import useSWR from 'swr';
import { useMemo } from 'react';

const fetcher = (...args) => fetch(...args).then((res) => {
  if (!res.ok) throw new Error('Erro ao buscar dados');
  return res.json();
});

export function useFinanceiroDashboard() {
  const { data, error, isLoading, mutate } = useSWR('/api/financeiro/dashboard', fetcher);
  return {
    dashboard: data,
    isLoading,
    isError: error,
    mutate
  };
}

export function useLancamentos(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `/api/financeiro/lancamentos${query ? '?' + query : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    lancamentos: data?.data || data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useCategorias() {
  const { data, error, isLoading } = useSWR('/api/financeiro/categorias', fetcher);
  return {
    categorias: data || [],
    isLoading,
    isError: error
  };
}

export function useContas() {
  const { data, error, isLoading } = useSWR('/api/financeiro/contas', fetcher);
  return {
    contas: data || [],
    isLoading,
    isError: error
  };
}

export function useMovimentacoes(params = {}) {
  const query = new URLSearchParams(params).toString();
  const url = `/api/financeiro/movimentacoes${query ? '?' + query : ''}`;
  
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);
  
  return {
    movimentacoes: data?.data || data || [],
    isLoading,
    isError: error,
    mutate
  };
}

export function useFluxoCaixa(ano) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/financeiro/lancamentos?limit=2000`,
    fetcher
  );

  const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  const MESES_CURTOS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

  const aggregatedData = useMemo(() => {
    if (!data) return [];
    const all = data.data || data || [];

    return MESES.map((nome, i) => {
      const mesStr = `${ano}-${String(i + 1).padStart(2, "0")}`;
      const doMes = all.filter(l => l.data_vencimento?.startsWith(mesStr));
      const recPrevisto  = doMes.filter(l => l.tipo === "receita").reduce((s, l) => s + l.valor, 0);
      const despPrevisto = doMes.filter(l => l.tipo === "despesa").reduce((s, l) => s + l.valor, 0);
      const recReal      = doMes.filter(l => l.tipo === "receita" && l.status === "pago").reduce((s, l) => s + l.valor, 0);
      const despReal     = doMes.filter(l => l.tipo === "despesa" && l.status === "pago").reduce((s, l) => s + l.valor, 0);

      return {
        mes: MESES_CURTOS[i],
        nomeMes: nome,
        recPrevisto,
        despPrevisto,
        recReal,
        despReal,
        saldoPrevisto: recPrevisto - despPrevisto,
        saldoReal:     recReal - despReal,
      };
    });
  }, [data, ano]);

  return {
    dados: aggregatedData,
    isLoading,
    isError: error,
    mutate
  };
}
