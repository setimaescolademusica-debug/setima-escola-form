import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { criarFormResposta, obterTodasAsRespostas, obterRespostasPorPagina, contarRespostas, deletarRespostaComAuditoria, obterHistoricoAuditoria } from "./db";
import { exportarParaCSV, exportarParaExcel } from "./export";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Endpoints para o formulário de matrícula
  form: router({
    // Enviar resposta do formulário
    enviarResposta: publicProcedure
      .input(
        z.object({
          nomeCompleto: z.string().min(3),
          whatsapp: z.string(),
          possuiInstrumento: z.string(),
          instrumento: z.string(),
          instrumentoCustomizado: z.string().optional(),
          classificacaoVocal: z.string().optional(),
          diasDisponiveis: z.array(z.string()),
          melhorHorario: z.string(),
          observacoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const resposta = await criarFormResposta({
          nomeCompleto: input.nomeCompleto,
          whatsapp: input.whatsapp,
          possuiInstrumento: input.possuiInstrumento,
          instrumento: input.instrumento,
          instrumentoCustomizado: input.instrumentoCustomizado,
          classificacaoVocal: input.classificacaoVocal,
          diasDisponiveis: JSON.stringify(input.diasDisponiveis),
          melhorHorario: input.melhorHorario,
          observacoes: input.observacoes,
        });
        return { success: true, message: 'Resposta enviada com sucesso!' };
      }),

    // Obter todas as respostas
    obterTodasAsRespostas: publicProcedure.query(async () => {
      const respostas = await obterTodasAsRespostas();
      return respostas.map(r => ({
        ...r,
        diasDisponiveis: JSON.parse(r.diasDisponiveis),
      }));
    }),

    // Obter respostas com paginação
    obterRespostasPaginadas: publicProcedure
      .input(
        z.object({
          pagina: z.number().int().positive().default(1),
          limite: z.number().int().positive().default(10),
        })
      )
      .query(async ({ input }) => {
        const respostas = await obterRespostasPorPagina(input.pagina, input.limite);
        const total = await contarRespostas();
        return {
          respostas: respostas.map(r => ({
            ...r,
            diasDisponiveis: JSON.parse(r.diasDisponiveis),
          })),
          total,
          pagina: input.pagina,
          limite: input.limite,
          totalPaginas: Math.ceil(total / input.limite),
        };
      }),

    // Contar total de respostas
    contarRespostas: publicProcedure.query(async () => {
      const total = await contarRespostas();
      return { total };
    }),

    // Exportar para CSV
    exportarCSV: publicProcedure.query(async () => {
      const csv = await exportarParaCSV();
      return { csv, filename: `respostas-setima-${new Date().toISOString().split('T')[0]}.csv` };
    }),

    // Exportar para Excel
    exportarExcel: publicProcedure.query(async () => {
      const buffer = await exportarParaExcel();
      const base64 = buffer.toString('base64');
      return { data: base64, filename: `respostas-setima-${new Date().toISOString().split('T')[0]}.xlsx` };
    }),

    // Deletar resposta com auditoria
    deletarResposta: publicProcedure
      .input(
        z.object({
          id: z.number().int().positive(),
          motivo: z.string().optional(),
          deletadoPor: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await deletarRespostaComAuditoria(input.id, input.motivo, input.deletadoPor);
      }),

    // Obter histórico de deleções
    obterHistoricoAuditoria: publicProcedure.query(async () => {
      return await obterHistoricoAuditoria();
    }),
  }),
});

export type AppRouter = typeof appRouter;
