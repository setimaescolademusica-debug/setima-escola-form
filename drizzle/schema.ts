import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela para armazenar respostas do formulário Mooni de matrículas de inglês
export const formRespostas = mysqlTable("form_respostas", {
  id: int("id").autoincrement().primaryKey(),
  // Bloco 1 - Informações dos Pais
  nomeResponsavel: varchar("nome_responsavel", { length: 255 }).notNull(),
  emailResponsavel: varchar("email_responsavel", { length: 320 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  cidade: varchar("cidade", { length: 100 }).notNull(),
  estado: varchar("estado", { length: 2 }).notNull(),
  // Bloco 2 - Informações da Criança
  nomeCrianca: varchar("nome_crianca", { length: 255 }).notNull(),
  dataNascimento: varchar("data_nascimento", { length: 10 }).notNull(), // YYYY-MM-DD
  anoEscolar: varchar("ano_escolar", { length: 50 }).notNull(),
  // Bloco 3 - Nível de Inglês
  nivelIngles: varchar("nivel_ingles", { length: 50 }).notNull(), // "iniciante", "basico", "intermediario", "avancado"
  // Bloco 4 - Objetivos
  objetivos: text("objetivos").notNull(), // JSON array: ["exames", "pronuncia", ...]
  // Bloco 5 - Disponibilidade
  diasDisponiveis: text("dias_disponiveis").notNull(), // JSON array: ["segunda", "terca", ...]
  horarioPreferido: varchar("horario_preferido", { length: 50 }).notNull(), // "manha", "tarde", "noite"
  // Bloco 6 - Preferências
  metodologiaPreferida: text("metodologia_preferida").notNull(), // JSON array: ["conversacional", "jogos", ...]
  // Bloco 7 - Informações Adicionais
  informacoesAdicionais: text("informacoes_adicionais"), // Campo aberto
  restricoes: text("restricoes"), // Campo opcional
  // Status e Auditoria
  status: mysqlEnum("status", ["novo", "msg_enviada", "aula_marcada", "matriculado"]).default("novo").notNull(),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().onUpdateNow().notNull(),
});

export type FormResposta = typeof formRespostas.$inferSelect;
export type InsertFormResposta = typeof formRespostas.$inferInsert;

// Tabela para auditoria de deleções
export const auditLog = mysqlTable("audit_log", {
  id: int("id").autoincrement().primaryKey(),
  acao: varchar("acao", { length: 50 }).notNull(), // "DELETE", "RESTORE", etc
  tabela: varchar("tabela", { length: 100 }).notNull(), // "form_respostas"
  registroId: int("registro_id").notNull(), // ID do registro deletado
  dadosBackup: text("dados_backup").notNull(), // JSON com dados completos antes da deleção
  motivo: text("motivo"), // Motivo da deleção
  deletadoPor: varchar("deletado_por", { length: 255 }), // Email/nome de quem deletou
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type InsertAuditLog = typeof auditLog.$inferInsert;