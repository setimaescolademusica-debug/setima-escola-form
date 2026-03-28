import { describe, it, expect, beforeAll } from 'vitest';
import { appRouter } from './routers';
import type { TrpcContext } from './_core/context';

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: 'https',
      headers: {},
    } as TrpcContext['req'],
    res: {} as TrpcContext['res'],
  };
}

describe('Form Router - Enviar Resposta', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  it('deve enviar uma resposta completa do formulário com sucesso', async () => {
    const resposta = await caller.form.enviarResposta({
      nomeCompleto: 'João Silva',
      whatsapp: '(11) 98765-4321',
      possuiInstrumento: 'Sim',
      instrumento: 'Piano / Teclado',
      diasDisponiveis: ['Segunda', 'Quarta', 'Sexta'],
      melhorHorario: 'Tarde (13h às 17h)',
      observacoes: 'Sou iniciante',
    });

    expect(resposta.success).toBe(true);
    expect(resposta.message).toBe('Resposta enviada com sucesso!');
  });

  it('deve enviar resposta com instrumento customizado', async () => {
    const resposta = await caller.form.enviarResposta({
      nomeCompleto: 'Maria Santos',
      whatsapp: '(21) 99876-5432',
      possuiInstrumento: 'Não',
      instrumento: 'Outros',
      instrumentoCustomizado: 'Flauta transversal',
      diasDisponiveis: ['Terça', 'Quinta'],
      melhorHorario: 'Manhã (08h às 12h)',
    });

    expect(resposta.success).toBe(true);
  });

  it('deve enviar resposta com classificação vocal', async () => {
    const resposta = await caller.form.enviarResposta({
      nomeCompleto: 'Ana Costa',
      whatsapp: '(31) 99123-4567',
      possuiInstrumento: 'Não tenho certeza',
      instrumento: 'Canto / Técnica Vocal',
      classificacaoVocal: 'Soprano',
      diasDisponiveis: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      melhorHorario: 'Noite (18h às 21h)',
      observacoes: 'Tenho experiência em coral',
    });

    expect(resposta.success).toBe(true);
  });

  it('deve validar nome completo com mínimo de 3 caracteres', async () => {
    try {
      await caller.form.enviarResposta({
        nomeCompleto: 'Jo',
        whatsapp: '(11) 98765-4321',
        possuiInstrumento: 'Sim',
        instrumento: 'Violão / Guitarra',
        diasDisponiveis: ['Segunda'],
        melhorHorario: 'Tarde (13h às 17h)',
      });
      expect.fail('Deveria ter lançado erro de validação');
    } catch (error: any) {
      expect(error.message).toContain('too_small');
    }
  });

  it('deve validar formato de WhatsApp', async () => {
    const resultado = await caller.form.enviarResposta({
      nomeCompleto: 'Pedro Silva',
      whatsapp: '(11) 98765-4321',
      possuiInstrumento: 'Sim',
      instrumento: 'Saxofone',
      diasDisponiveis: ['Quarta'],
      melhorHorario: 'Manhã (08h às 12h)',
    });
    expect(resultado.success).toBe(true);
  });

  it('deve exigir pelo menos um dia disponível', async () => {
    try {
      await caller.form.enviarResposta({
        nomeCompleto: 'Lucas Oliveira',
        whatsapp: '(41) 99234-5678',
        possuiInstrumento: 'Sim',
        instrumento: 'Clarineta',
        diasDisponiveis: [],
        melhorHorario: 'Tarde (13h às 17h)',
      });
      expect.fail('Deveria ter lançado erro de validação');
    } catch (error: any) {
      expect(error.message).toBeTruthy();
    }
  });
});

describe('Form Router - Obter Respostas', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);

    await caller.form.enviarResposta({
      nomeCompleto: 'Teste 1',
      whatsapp: '(11) 91111-1111',
      possuiInstrumento: 'Sim',
      instrumento: 'Piano / Teclado',
      diasDisponiveis: ['Segunda'],
      melhorHorario: 'Tarde (13h às 17h)',
    });

    await caller.form.enviarResposta({
      nomeCompleto: 'Teste 2',
      whatsapp: '(11) 92222-2222',
      possuiInstrumento: 'Não',
      instrumento: 'Violão / Guitarra',
      diasDisponiveis: ['Terça', 'Quinta'],
      melhorHorario: 'Manhã (08h às 12h)',
    });
  });

  it('deve obter todas as respostas', async () => {
    const respostas = await caller.form.obterTodasAsRespostas();

    expect(Array.isArray(respostas)).toBe(true);
    expect(respostas.length).toBeGreaterThan(0);
    expect(respostas[0]).toHaveProperty('nomeCompleto');
    expect(respostas[0]).toHaveProperty('whatsapp');
    expect(respostas[0]).toHaveProperty('instrumento');
  });

  it('deve obter respostas com paginação', async () => {
    const resultado = await caller.form.obterRespostasPaginadas({
      pagina: 1,
      limite: 10,
    });

    expect(resultado).toHaveProperty('respostas');
    expect(resultado).toHaveProperty('total');
    expect(resultado).toHaveProperty('pagina');
    expect(resultado).toHaveProperty('limite');
    expect(resultado).toHaveProperty('totalPaginas');
    expect(Array.isArray(resultado.respostas)).toBe(true);
  });

  it('deve contar total de respostas', async () => {
    const resultado = await caller.form.contarRespostas();

    expect(resultado).toHaveProperty('total');
    expect(typeof resultado.total).toBe('number');
    expect(resultado.total).toBeGreaterThan(0);
  });

  it('deve parsear diasDisponiveis como array', async () => {
    const respostas = await caller.form.obterTodasAsRespostas();

    const primeiraResposta = respostas[0];
    expect(Array.isArray(primeiraResposta.diasDisponiveis)).toBe(true);
    expect(primeiraResposta.diasDisponiveis.length).toBeGreaterThan(0);
  });
});

describe('Form Router - Validação de Dados', () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  it('deve aceitar observações opcionais', async () => {
    const resposta = await caller.form.enviarResposta({
      nomeCompleto: 'Carlos Mendes',
      whatsapp: '(51) 99345-6789',
      possuiInstrumento: 'Sim',
      instrumento: 'Violino',
      diasDisponiveis: ['Quarta'],
      melhorHorario: 'Noite (18h às 21h)',
    });

    expect(resposta.success).toBe(true);
  });

  it('deve aceitar classificação vocal apenas para canto', async () => {
    const resposta = await caller.form.enviarResposta({
      nomeCompleto: 'Beatriz Lima',
      whatsapp: '(61) 99456-7890',
      possuiInstrumento: 'Não',
      instrumento: 'Canto / Técnica Vocal',
      classificacaoVocal: 'Mezzo-soprano',
      diasDisponiveis: ['Segunda', 'Quarta'],
      melhorHorario: 'Tarde (13h às 17h)',
    });

    expect(resposta.success).toBe(true);
  });

  it('deve aceitar múltiplos dias da semana', async () => {
    const resposta = await caller.form.enviarResposta({
      nomeCompleto: 'Rafael Gomes',
      whatsapp: '(71) 99567-8901',
      possuiInstrumento: 'Sim',
      instrumento: 'Saxofone',
      diasDisponiveis: ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'],
      melhorHorario: 'Manhã (08h às 12h)',
    });

    expect(resposta.success).toBe(true);
  });
});
