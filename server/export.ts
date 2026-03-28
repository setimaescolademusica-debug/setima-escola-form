import { obterTodasAsRespostas } from './db';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

/**
 * Formatar dados das respostas para exportação
 */
function formatarDadosParaExportacao(respostas: any[]) {
  return respostas.map((resposta) => ({
    'Nome Completo': resposta.nomeCompleto,
    'WhatsApp': resposta.whatsapp,
    'Possui Instrumento': resposta.possuiInstrumento,
    'Instrumento': resposta.instrumento,
    'Instrumento Customizado': resposta.instrumentoCustomizado || '-',
    'Classificação Vocal': resposta.classificacaoVocal || '-',
    'Dias Disponíveis': Array.isArray(resposta.diasDisponiveis)
      ? resposta.diasDisponiveis.join(', ')
      : resposta.diasDisponiveis,
    'Melhor Horário': resposta.melhorHorario,
    'Observações': resposta.observacoes || '-',
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
    const workbook = XLSX.utils.book_new();

    // Adicionar worksheet com os dados
    const worksheet = XLSX.utils.json_to_sheet(dadosFormatados);

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 20 }, // Nome Completo
      { wch: 18 }, // WhatsApp
      { wch: 18 }, // Possui Instrumento
      { wch: 20 }, // Instrumento
      { wch: 20 }, // Instrumento Customizado
      { wch: 18 }, // Classificação Vocal
      { wch: 25 }, // Dias Disponíveis
      { wch: 18 }, // Melhor Horário
      { wch: 30 }, // Observações
      { wch: 20 }, // Data de Envio
    ];
    worksheet['!cols'] = colWidths;

    // Adicionar estilos ao header
    const headerStyle = {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: 'FCA311' } }, // Laranja da Sétima
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    };

    // Aplicar estilo ao header
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + '1';
      if (!worksheet[address]) continue;
      worksheet[address].s = headerStyle;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Respostas');

    // Converter para buffer
    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
  } catch (error) {
    console.error('[Export] Erro ao exportar para Excel:', error);
    throw error;
  }
}

/**
 * Exportar respostas com filtros (opcional para futuro)
 */
export async function exportarComFiltros(filtros?: {
  instrumento?: string;
  horario?: string;
  dataInicio?: Date;
  dataFim?: Date;
}): Promise<string> {
  try {
    let respostas = await obterTodasAsRespostas();

    // Aplicar filtros se fornecidos
    if (filtros) {
      if (filtros.instrumento) {
        respostas = respostas.filter(
          (r) => r.instrumento.toLowerCase().includes(filtros.instrumento!.toLowerCase())
        );
      }
      if (filtros.horario) {
        respostas = respostas.filter((r) => r.melhorHorario === filtros.horario);
      }
      if (filtros.dataInicio) {
        respostas = respostas.filter((r) => new Date(r.criadoEm) >= filtros.dataInicio!);
      }
      if (filtros.dataFim) {
        respostas = respostas.filter((r) => new Date(r.criadoEm) <= filtros.dataFim!);
      }
    }

    const dadosFormatados = formatarDadosParaExportacao(respostas);
    const csv = Papa.unparse(dadosFormatados);
    return csv;
  } catch (error) {
    console.error('[Export] Erro ao exportar com filtros:', error);
    throw error;
  }
}
