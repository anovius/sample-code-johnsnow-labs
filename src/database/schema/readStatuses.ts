import { index, int, mysqlTable, timestamp } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { subtopics } from "./subtopics";
import { relations } from "drizzle-orm";

export const readStatuses = mysqlTable("readStatuses", {
    id: int("id").primaryKey().autoincrement(),
    userId: int("userId").notNull(),
    subtopicId: int("subtopicId").notNull(),
    lastMessageReadAt: timestamp("lastMessageReadAt").defaultNow(),
    unreadCount: int("unreadCount").default(0),
}, table => {
    return {
        userSubtopicIndex: index("userSubtopicIndex").on(table.userId, table.subtopicId),
    }
});

export type ReadStatus = typeof readStatuses.$inferSelect;

export const ReadStatusRelations = relations(readStatuses, ({ one }) => {
    return {
        user: one(users, {
            fields: [readStatuses.userId],
            references: [users.id]
        }),

        subtopic: one(subtopics, {
            fields: [readStatuses.subtopicId],
            references: [subtopics.id]
        }),
    }
});