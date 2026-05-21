import { getDb } from './db';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Obter todas as respostas do banco de dados
 */
async function obterTodasAsRespostas() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  // Importar schema
  const { formRespostas } = await import('../drizzle/schema');
  const respostas = await db.select().from(formRespostas);
  return respostas;
}

/**
 * Formatar dados das respostas para exportação
 */
function formatarDadosParaExportacao(respostas: any[]) {
  return respostas.map((resposta) => ({
    'Nome Responsável': resposta.nomeResponsavel,
    'Email': resposta.emailResponsavel,
    'WhatsApp': resposta.whatsapp,
    'Cidade': resposta.cidade,
    'Estado': resposta.estado,
    'Nome da Criança': resposta.nomeCrianca,
    'Data de Nascimento': resposta.dataNascimento,
    'Ano Escolar': resposta.anoEscolar,
    'Nível de Inglês': resposta.nivelIngles,
    'Objetivos': Array.isArray(resposta.objetivos)
      ? resposta.objetivos.join(', ')
      : resposta.objetivos,
    'Dias Disponíveis': Array.isArray(resposta.diasDisponiveis)
      ? resposta.diasDisponiveis.join(', ')
      : resposta.diasDisponiveis,
    'Horário Preferido': resposta.horarioPreferido,
    'Metodologia Preferida': Array.isArray(resposta.metodologiaPreferida)
      ? resposta.metodologiaPreferida.join(', ')
      : resposta.metodologiaPreferida,
    'Informações Adicionais': resposta.informacoesAdicionais || '-',
    'Restrições': resposta.restricoes || '-',
    'Status': resposta.status,
    'Data de Envio': new Date(resposta.criadoEm).toLocaleString('pt-BR'),
  }));
}

/**
 * Exportar respostas para CSV
 */
export async function exportarParaCSV(): Promise<string> {
  try {
    const respostas = await obterTodasAsRespostas();
    const dadosFormatados = formatarDadosParaExportacao(respostas);

    // Usar PapaParse para converter para CSV
    const csv = Papa.unparse(dadosFormatados);
    return csv;
  } catch (error) {
    console.error('[Export] Erro ao exportar para CSV:', error);
    throw error;
  }
}

/**
 * Exportar respostas para Excel
 */
export async function exportarParaExcel(): Promise<Buffer> {
  try {
    const respostas = await obterTodasAsRespostas();
    const dadosFormatados = formatarDadosParaExportacao(respostas);

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(dadosFormatados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Matrículas');

    // Ajustar largura das colunas
    const colWidths = Object.keys(dadosFormatados[0] || {}).map(() => 20);
    ws['!cols'] = colWidths.map(w => ({ wch: w }));

    // Gerar buffer
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
    return buffer as Buffer;
  } catch (error) {
    console.error('[Export] Erro ao exportar para Excel:', error);
    throw error;
  }
}
