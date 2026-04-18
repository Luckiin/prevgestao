/**
 * calendarUtils.js
 * Utilitários para lógica de calendário mensal
 */

/**
 * Retorna os dias de um mês específico para montar a grade
 */
export function getDaysInMonth(year, month) {
  const date = new Date(year, month, 1);
  const days = [];
  
  // Encontrar o primeiro dia da semana (0 = Domingo)
  // Se quisermos que Segunda seja o primeiro dia, ajustamos aqui
  const startDay = date.getDay(); 
  
  // Adicionar dias vazios ou do mês anterior para completar a primeira semana
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      month: month - 1,
      year: year,
      isCurrentMonth: false,
    });
  }
  
  // Dias do mês atual
  const lastDay = new Date(year, month + 1, 0).getDate();
  for (let i = 1; i <= lastDay; i++) {
    days.push({
      day: i,
      month: month,
      year: year,
      isCurrentMonth: true,
    });
  }
  
  // Completar a última semana com dias do próximo mês
  const totalCells = days.length > 35 ? 42 : 35; // 5 ou 6 linhas
  const nextDaysNeeded = totalCells - days.length;
  for (let i = 1; i <= nextDaysNeeded; i++) {
    days.push({
      day: i,
      month: month + 1,
      year: year,
      isCurrentMonth: false,
    });
  }
  
  return days;
}

/**
 * Formata data no estilo ISO (YYYY-MM-DD) preservando fuso local para comparação
 */
export function formatISOLocal(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export const DAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
