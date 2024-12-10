import { relations } from "drizzle-orm";
import { boolean, index, int, mysqlTable, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { userSpaceRoles } from "./userSpaceRoles";
import { spaces } from "./spaces";

export const spaceRoles = mysqlTable("spaceRoles", {
    id: int("id").primaryKey().autoincrement(),
    spaceId: int("subtopicId").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    color: varchar("color", { length: 100 }).notNull(),
    
    //general permissions
    viewModerateSubChannel: boolean("viewModerateSubChannel").default(true),
    
    //membership permissions
    createInvite: boolean("createInvite").default(false),
    kickMembers: boolean("kickMembers").default(false),
    banMembers: boolean("banMembers").default(false),
    pinMessages: boolean("pinMessages").default(false),
    
    //space permissions
    sendMessages: boolean("sendMessages").default(true),
    createPublicThreads: boolean("createPublicThreads").default(true),
    embeddedLinks: boolean("embeddedLinks").default(true),
    attachFiles: boolean("attachFiles").default(true),
    addReactions: boolean("addReactions").default(true),
    sendVoiceMessages: boolean("sendVoiceMessages").default(false),

}, table => {
    return {
        idIndex: uniqueIndex("idIndex").on(table.id),
        subtopicIndex: index("subtopicIndex").on(table.spaceId),
    }
});


export const SpaceRole = spaceRoles.$inferSelect;

// RELATIONS
export const SpaceRoleRelations = relations(spaceRoles, ({ one, many }) => {
    return {
        space: one(spaces, {
            fields: [spaceRoles.spaceId],
            references: [spaces.id]
        }),
        userSpaceRoles: many(userSpaceRoles)
    }
});