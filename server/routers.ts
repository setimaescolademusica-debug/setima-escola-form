import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { criarFormResposta, obterTodasAsRespostas, obterRespostasPorPagina, contarRespostas, deletarRespostaComAuditoria, obterHistoricoAuditoria, atualizarStatusResposta } from "./db";
import { exportarParaCSV, exportarParaExcel } from "./export";
import { COOKIE_NAME } from "@shared/const";

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

  // Endpoints para o formulário de matrícula Mooni
  form: router({
    // Enviar resposta do formulário
    enviarResposta: publicProcedure
      .input(
        z.object({
          nomeResponsavel: z.string().min(3),
          emailResponsavel: z.string().email(),
          whatsapp: z.string(),
          cidade: z.string(),
          estado: z.string(),
          nomeCrianca: z.string(),
          dataNascimento: z.string(),
          anoEscolar: z.string(),
          nivelIngles: z.string(),
          objetivos: z.array(z.string()),
          diasDisponiveis: z.array(z.string()),
          horarioPreferido: z.string(),
          metodologiaPreferida: z.array(z.string()),
          informacoesAdicionais: z.string().optional(),
          restricoes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const resposta = await criarFormResposta({
          nomeResponsavel: input.nomeResponsavel,
          emailResponsavel: input.emailResponsavel,
          whatsapp: input.whatsapp,
          cidade: input.cidade,
          estado: input.estado,
          nomeCrianca: input.nomeCrianca,
          dataNascimento: input.dataNascimento,
          anoEscolar: input.anoEscolar,
          nivelIngles: input.nivelIngles,
          objetivos: JSON.stringify(input.objetivos),
          diasDisponiveis: JSON.stringify(input.diasDisponiveis),
          horarioPreferido: input.horarioPreferido,
          metodologiaPreferida: JSON.stringify(input.metodologiaPreferida),
          informacoesAdicionais: input.informacoesAdicionais,
          restricoes: input.restricoes,
        });
        return { success: true, message: 'Resposta enviada com sucesso!' };
      }),

    // Obter todas as respostas
    obterTodasAsRespostas: publicProcedure.query(async () => {
      const respostas = await obterTodasAsRespostas();
      return respostas.map(r => ({
        ...r,
        objetivos: JSON.parse(r.objetivos),
        diasDisponiveis: JSON.parse(r.diasDisponiveis),
        metodologiaPreferida: JSON.parse(r.metodologiaPreferida),
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
            objetivos: JSON.parse(r.objetivos),
            diasDisponiveis: JSON.parse(r.diasDisponiveis),
            metodologiaPreferida: JSON.parse(r.metodologiaPreferida),
          })),
          total,
          pagina: input.pagina,
          limite: input.limite,
        };
      }),

    // Contar respostas
    contarRespostas: publicProcedure.query(async () => {
      const total = await contarRespostas();
      return total;
    }),

    // Deletar resposta com auditoria
    deletarResposta: publicProcedure
      .input(
        z.object({
          id: z.number(),
          motivo: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        await deletarRespostaComAuditoria(input.id, input.motivo);
        return { success: true, message: 'Resposta deletada com sucesso!' };
      }),

    // Obter histórico de auditoria
    obterHistoricoAuditoria: publicProcedure.query(async () => {
      const historico = await obterHistoricoAuditoria();
      return historico;
    }),

    // Atualizar status da resposta
    atualizarStatus: publicProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(['novo', 'msg_enviada', 'aula_marcada', 'matriculado']),
        })
      )
      .mutation(async ({ input }) => {
        await atualizarStatusResposta(input.id, input.status);
        return { success: true, message: 'Status atualizado com sucesso!' };
      }),

    // Exportar para CSV
    exportarCSV: publicProcedure.query(async () => {
      const csv = await exportarParaCSV();
      return csv;
    }),

    // Exportar para Excel
    exportarExcel: publicProcedure.query(async () => {
      const excel = await exportarParaExcel();
      return excel;
    }),
  }),
});

export type AppRouter = typeof appRouter;
