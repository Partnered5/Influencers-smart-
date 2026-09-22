import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const creatorWorkspaces = mysqlTable("creator_workspaces", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  creatorName: varchar("creatorName", { length: 120 }).notNull(),
  creatorBio: text("creatorBio").notNull(),
  persona: text("persona").notNull(),
  voice: text("voice").notNull(),
  visualAnchor: text("visualAnchor").notNull(),
  disclosureEnabled: int("disclosureEnabled").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const avatarProfiles = mysqlTable("avatar_profiles", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  prompt: text("prompt").notNull(),
  seed: int("seed").notNull(),
  pose: varchar("pose", { length: 80 }).notNull(),
  wardrobe: varchar("wardrobe", { length: 120 }).notNull(),
  identityLock: int("identityLock").notNull().default(1),
  ageConfirmed: int("ageConfirmed").notNull().default(1),
  referenceImageKey: varchar("referenceImageKey", { length: 255 }),
  referenceImageUrl: varchar("referenceImageUrl", { length: 500 }),
  variationGroup: varchar("variationGroup", { length: 64 }),
  variationIndex: int("variationIndex").default(0),
  isSelected: int("isSelected").default(0).notNull(),
  imageKey: varchar("imageKey", { length: 255 }),
  imageUrl: varchar("imageUrl", { length: 500 }),
  status: mysqlEnum("status", ["draft", "generating", "ready", "failed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const contentItems = mysqlTable("content_items", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  avatarProfileId: int("avatarProfileId"),
  title: varchar("title", { length: 180 }).notNull(),
  kind: mysqlEnum("kind", ["image", "video", "caption", "campaign", "export"]).notNull(),
  channel: varchar("channel", { length: 40 }),
  format: varchar("format", { length: 40 }),
  body: text("body"),
  assetKey: varchar("assetKey", { length: 255 }),
  assetUrl: varchar("assetUrl", { length: 500 }),
  disclosureStamp: varchar("disclosureStamp", { length: 180 }).notNull().default("AI-generated virtual creator"),
  status: mysqlEnum("status", ["draft", "ready", "exported"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const videoJobs = mysqlTable("video_jobs", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  objective: varchar("objective", { length: 180 }).notNull(),
  prompt: text("prompt").notNull(),
  script: text("script").notNull(),
  aspectRatio: mysqlEnum("aspectRatio", ["portrait", "landscape"]).notNull().default("portrait"),
  durationSeconds: int("durationSeconds").notNull().default(15),
  voiceover: int("voiceover").notNull().default(1),
  assetKey: varchar("assetKey", { length: 255 }),
  assetUrl: varchar("assetUrl", { length: 500 }),
  providerJobId: varchar("providerJobId", { length: 180 }),
  status: mysqlEnum("status", ["draft", "queued", "ready", "failed"]).notNull().default("draft"),
  disclosureStamp: varchar("disclosureStamp", { length: 180 }).notNull().default("AI-generated virtual creator · Influencer Smart"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CreatorWorkspace = typeof creatorWorkspaces.$inferSelect;
export type AvatarProfile = typeof avatarProfiles.$inferSelect;
export type ContentItem = typeof contentItems.$inferSelect;
export type VideoJob = typeof videoJobs.$inferSelect;
