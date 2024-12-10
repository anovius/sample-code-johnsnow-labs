import { relations } from "drizzle-orm";
import { int, mysqlTable, unique } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { spaces } from "./spaces";
import { spaceRoles } from "./spaceRoles";

export const userSpaceRoles = mysqlTable("userSpaceRoles", {
    id: int("id").primaryKey().autoincrement(),
    spaceId: int("spaceId").notNull(),
    userId: int("userId").notNull(),
    spaceRoleId: int("spaceRoleId").notNull(),
}, table => {
    return {
        uniqueIndex: unique("uniqueIndex").on(table.spaceId, table.userId, table.spaceRoleId)
    }
});

export type UserSpaceRole = typeof userSpaceRoles.$inferSelect;

// RELATIONS
export const UserSpaceRoleRelations = relations(userSpaceRoles, ({ one }) => {
    return {
        user: one(users, {
            fields: [userSpaceRoles.userId],
            references: [users.id]
        }),
        space: one(spaces, {
            fields: [userSpaceRoles.spaceId],
            references: [spaces.id]
        }),
        spaceRole: one(spaceRoles, {
            fields: [userSpaceRoles.spaceRoleId],
            references: [spaceRoles.id]
        })
    }
});