import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, formRespostas, InsertFormResposta, auditLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funções para gerenciar respostas do formulário
export async function criarFormResposta(resposta: InsertFormResposta) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(formRespostas).values(resposta);
    return result;
  } catch (error) {
    console.error("[Database] Failed to create form response:", error);
    throw error;
  }
}

export async function obterTodasAsRespostas() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const respostas = await db
      .select()
      .from(formRespostas)
      .orderBy(desc(formRespostas.criadoEm));
    return respostas;
  } catch (error) {
    console.error("[Database] Failed to fetch form responses:", error);
    throw error;
  }
}

export async function obterRespostasPorPagina(pagina: number = 1, limite: number = 10) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const offset = (pagina - 1) * limite;
    const respostas = await db
      .select()
      .from(formRespostas)
      .orderBy(desc(formRespostas.criadoEm))
      .limit(limite)
      .offset(offset);
    return respostas;
  } catch (error) {
    console.error("[Database] Failed to fetch paginated responses:", error);
    throw error;
  }
}

export async function contarRespostas() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.select().from(formRespostas);
    return result.length;
  } catch (error) {
    console.error("[Database] Failed to count responses:", error);
    throw error;
  }
}

// Funções para deleção segura com auditoria
export async function obterRespostaPorId(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db
      .select()
      .from(formRespostas)
      .where(eq(formRespostas.id, id))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to fetch response by id:", error);
    throw error;
  }
}

export async function deletarRespostaComAuditoria(
  id: number,
  motivo?: string,
  deletadoPor?: string
) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // 1. Obter dados completos antes de deletar (backup)
    const resposta = await obterRespostaPorId(id);
    if (!resposta) {
      throw new Error(`Resposta com ID ${id} não encontrada`);
    }

    // 2. Registrar na auditoria
    const auditEntry = {
      acao: "DELETE",
      tabela: "form_respostas",
      registroId: id,
      dadosBackup: JSON.stringify(resposta),
      motivo: motivo || "Sem motivo especificado",
      deletadoPor: deletadoPor || "Sistema",
    };

    await db.insert(auditLog).values(auditEntry);

    // 3. Deletar o registro
    await db.delete(formRespostas).where(eq(formRespostas.id, id));

    return { success: true, message: "Resposta deletada com sucesso e auditada" };
  } catch (error) {
    console.error("[Database] Failed to delete response:", error);
    throw error;
  }
}

// Obter histórico de deleções
export async function obterHistoricoAuditoria() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const historico = await db
      .select()
      .from(auditLog)
      .orderBy(desc(auditLog.criadoEm));
    return historico;
  } catch (error) {
    console.error("[Database] Failed to fetch audit history:", error);
    throw error;
  }
}
