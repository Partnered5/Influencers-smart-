import { and, desc, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { creatorWorkspaces, avatarProfiles, contentItems, InsertUser, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId, name: user.name ?? null, email: user.email ?? null, loginMethod: user.loginMethod ?? null, lastSignedIn: user.lastSignedIn ?? new Date() };
  const updateSet: Record<string, unknown> = { name: values.name, email: values.email, loginMethod: values.loginMethod, lastSignedIn: values.lastSignedIn };
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; } else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function listWorkspaces(userId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(creatorWorkspaces).where(eq(creatorWorkspaces.userId, userId)).orderBy(desc(creatorWorkspaces.updatedAt));
}

export async function createWorkspace(input: typeof creatorWorkspaces.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const result = await db.insert(creatorWorkspaces).values(input);
  return Number(result[0].insertId);
}

export async function getWorkspaceForUser(workspaceId: number, userId: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(creatorWorkspaces).where(and(eq(creatorWorkspaces.id, workspaceId), eq(creatorWorkspaces.userId, userId))).limit(1);
  return result[0];
}

export async function createAvatarProfile(input: typeof avatarProfiles.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const result = await db.insert(avatarProfiles).values(input);
  return Number(result[0].insertId);
}

export async function updateAvatarProfile(id: number, input: Partial<typeof avatarProfiles.$inferInsert>) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  await db.update(avatarProfiles).set(input).where(eq(avatarProfiles.id, id));
}

export async function listContentItems(workspaceId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(contentItems).where(eq(contentItems.workspaceId, workspaceId)).orderBy(desc(contentItems.updatedAt)).limit(50);
}

export async function createContentItem(input: typeof contentItems.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  const result = await db.insert(contentItems).values(input);
  return Number(result[0].insertId);
}

export async function listAvatarVariations(workspaceId: number, variationGroup: string) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(avatarProfiles).where(and(eq(avatarProfiles.workspaceId, workspaceId), eq(avatarProfiles.variationGroup, variationGroup))).orderBy(avatarProfiles.variationIndex);
}

export async function getAvatarProfileById(workspaceId: number, profileId: number) {
  const db = await getDb(); if (!db) return undefined;
  const rows = await db.select().from(avatarProfiles).where(and(eq(avatarProfiles.workspaceId, workspaceId), eq(avatarProfiles.id, profileId))).limit(1);
  return rows[0];
}

export async function updateVariationRanks(workspaceId: number, variationGroup: string, profileIds: number[]) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  for (let rank = 0; rank < profileIds.length; rank += 1) {
    const profileId = profileIds[rank];
    await db.update(avatarProfiles).set({ variationIndex: rank }).where(and(eq(avatarProfiles.workspaceId, workspaceId), eq(avatarProfiles.variationGroup, variationGroup), eq(avatarProfiles.id, profileId)));
  }
}

export async function getAvatarProfilesByIds(workspaceId: number, profileIds: number[]) {
  const db = await getDb(); if (!db || profileIds.length === 0) return [];
  return db.select().from(avatarProfiles).where(and(eq(avatarProfiles.workspaceId, workspaceId), inArray(avatarProfiles.id, profileIds)));
}

export async function selectAvatarVariation(workspaceId: number, variationGroup: string, profileId: number) {
  const db = await getDb(); if (!db) throw new Error("Database is not available");
  await db.update(avatarProfiles).set({ isSelected: 0 }).where(and(eq(avatarProfiles.workspaceId, workspaceId), eq(avatarProfiles.variationGroup, variationGroup)));
  await db.update(avatarProfiles).set({ isSelected: 1 }).where(and(eq(avatarProfiles.workspaceId, workspaceId), eq(avatarProfiles.variationGroup, variationGroup), eq(avatarProfiles.id, profileId)));
}
