import config from "@config/index";
import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { relations } from "drizzle-orm";
import { members } from "./members";
import { topics } from "./topics";
import { posts } from "./posts";
import { spaceRoles } from "./spaceRoles";
import { userSpaceRoles } from "./userSpaceRoles";


export const SpaceStatus = mysqlEnum( "status", [ "pending", "approved", "declined", "blocked" ] );

type Links = [
    {
        name: string,
        url: string
    }
]

export const spaces = mysqlTable( "spaces", {
    id: int( "id" ).primaryKey().autoincrement(),
    slug: varchar( "slug", { length: 256 } ).notNull(),
    name: varchar( "name", { length: 256 } ).notNull(),
    projectDescription: text( "description" ),
    profilePhoto: varchar( "profilePhoto", { length: 256 } ).default( config.defaultProfilePhoto ),
    coverPhoto: varchar( "coverPhoto", { length: 256 } ).default( config.defaultCoverPhoto ),
    adminWalletAddress: varchar( "adminWalletAddress", { length: 256 } ).notNull(),
    blockchain: varchar( "blockchain", { length: 256 } ).notNull(),
    contractAddress: varchar( "contractAddress", { length: 256 } ).notNull(),
    keywords: text( "keywords" ),
    links: json( "links" ).$type<Links>(),
    membersCount: int( "membersCount" ).default( 1 ),
    status: SpaceStatus.default( "approved" ),
    createdAt: timestamp( 'createdAt' ).defaultNow(),
    defaultRoleId: int( "defaultRoleId" )
}, table => {
    return {
        idIndex: uniqueIndex( "idIndex" ).on( table.id ),
        slugIdIndex: index( "slugIdIndex" ).on( table.id, table.slug ),
    }
} );

export type Space = typeof spaces.$inferSelect;


// RELATIONS
export const SpaceRelations = relations( spaces, ( { one, many } ) => {
    return {
        admin: one( users, {
            fields: [ spaces.adminWalletAddress ],
            references: [ users.walletAddress ]
        } ),
        members: many( members ),
        topics: many( topics ),
        posts: many( posts ),
        spaceRoles: many( spaceRoles ),
        userSpaceRoles: many( userSpaceRoles ),
        defaultRole: one( spaceRoles, {
            fields: [ spaces.defaultRoleId ],
            references: [ spaceRoles.id ]
        } )
    }
} )