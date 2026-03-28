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

// Tabela para armazenar respostas do formulário de intenção de matrícula
export const formRespostas = mysqlTable("form_respostas", {
  id: int("id").autoincrement().primaryKey(),
  nomeCompleto: varchar("nome_completo", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 20 }).notNull(),
  possuiInstrumento: varchar("possui_instrumento", { length: 50 }).notNull(), // "Sim", "Não", "Não tenho certeza"
  instrumento: varchar("instrumento", { length: 255 }).notNull(), // Instrumento escolhido
  instrumentoCustomizado: text("instrumento_customizado"), // Se escolheu "Outros"
  classificacaoVocal: varchar("classificacao_vocal", { length: 100 }), // Se escolheu "Canto"
  diasDisponiveis: text("dias_disponiveis").notNull(), // JSON array: ["Segunda", "Terça", ...]
  melhorHorario: varchar("melhor_horario", { length: 50 }).notNull(), // "Manhã", "Tarde", "Noite"
  observacoes: text("observacoes"), // Campo opcional
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