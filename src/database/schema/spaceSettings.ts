import { boolean, index, int, mysqlEnum, mysqlTable, timestamp, uniqueIndex, } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { relations } from "drizzle-orm";





export const spaceSettings = mysqlTable( "spaceSettings", {
    id: int( "id" ).primaryKey().autoincrement(),
    userId: int( "userId" ).notNull(),
    spaceId: int( "spaceId" ).notNull(),
    mentions: boolean( 'mentions' ).default( true ),
    replies: boolean( 'replies' ).default( true ),
    messages: boolean( 'messages' ).default( true ),
    mute: boolean( 'mute' ).default( false ),
    createdAt: timestamp( 'createdAt' ).defaultNow(),
}, table => {
    return {
        idIndex: uniqueIndex( "idIndex" ).on( table.id ),

    }
} );

export type SpaceSetting = typeof spaceSettings.$inferSelect;

//RELATIONS

export const SpaceSettingsRelations = relations( spaceSettings, ( { one } ) => {
    return {


        user: one( users, {
            fields: [ spaceSettings.userId ],
            references: [ users.id ]
        } )
    }
} );