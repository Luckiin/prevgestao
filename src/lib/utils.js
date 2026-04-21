import { clsx } from "clsx";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";


export function cn(...inputs) {
  return clsx(inputs);
}


export function formatCPF(cpf) {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, "");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}


export function cleanCPF(cpf) {
  return (cpf || "").replace(/\D/g, "");
}


export function validarCPF(cpf) {
  const nums = cleanCPF(cpf);
  if (nums.length !== 11 || /^(\d)\1+$/.test(nums)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(nums[i]) * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== parseInt(nums[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(nums[i]) * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === parseInt(nums[10]);
}


export function formatMoeda(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}


export function maskMoeda(value) {
  if (!value) return "";
  let v = String(value).replace(/\D/g, "");
  if (!v) return "";
  v = (Number(v) / 100).toFixed(2).replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return v;
}


export function formatData(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(d, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return "—";
  }
}


export function formatDataHora(dateStr) {
  if (!dateStr) return "—";
  try {
    const d = typeof dateStr === "string" ? parseISO(dateStr) : dateStr;
    return format(d, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  } catch {
    return "—";
  }
}


export function calcIdade(dataNasc) {
  if (!dataNasc) return null;
  const nasc = typeof dataNasc === "string" ? parseISO(dataNasc) : dataNasc;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}


export function corStatus(status) {
  switch (status) {
    case "Ativo":     return "text-success-500 bg-success-500/10 border-success-500/20";
    case "Concluído": return "text-brand-400 bg-brand-500/10 border-brand-500/20";
    case "Inativo":   return "text-ink-400 bg-ink-500/10 border-ink-500/20";
    default:          return "text-ink-300 bg-ink-500/10 border-ink-500/20";
  }
}


export function diasRestantes(dataPrazo) {
  if (!dataPrazo) return null;
  const prazo = typeof dataPrazo === "string" ? parseISO(dataPrazo) : dataPrazo;
  const hoje  = new Date();
  hoje.setHours(0, 0, 0, 0);
  const diff  = prazo - hoje;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


export function corPrazo(dias) {
  if (dias < 0)  return "text-danger-500";
  if (dias <= 3) return "text-danger-400";
  if (dias <= 7) return "text-warn-500";
  return "text-success-500";
}
