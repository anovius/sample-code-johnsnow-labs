import config from '@config/index';
import { relations } from 'drizzle-orm';
import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';
import jwt from 'jsonwebtoken';
import { spaces } from './spaces';
import { members } from './members';
import { posts } from './posts';
import { postReactions } from './postReactions';
import { comments } from './comments';
import { commentReactions } from './commentReactions';
import { participants } from './partcipants';
import { messages } from './messages';
import { userSpaceRoles } from './userSpaceRoles';
import { chats } from './chats';

export const UserRole = mysqlEnum('role', ['USER', 'ADMIN']);
export const UserStatus = mysqlEnum('status', ['active', 'inactive']);

export const users = mysqlTable(
  'users',
  {
    id: int('id').primaryKey().autoincrement(),
    fullName: varchar('fullName', { length: 256 }),
    username: varchar('username', { length: 256 }),
    walletAddress: varchar('walletAddress', { length: 256 }).notNull(),
    bio: text('bio'),
    headline: varchar('headline', { length: 256 }),
    website: varchar('website', { length: 256 }),
    x: varchar('x', { length: 256 }),
    profilePhoto: varchar('profilePhoto', { length: 256 }).default(
      config.defaultProfilePhoto,
    ),
    coverPhoto: varchar('coverPhoto', { length: 256 }).default(
      config.defaultCoverPhoto,
    ),
    nonce: varchar('nonce', { length: 256 }),
    status: UserStatus.default('active'),
    role: UserRole.default('USER'),
    createdAt: timestamp('createdAt').defaultNow(),
    followingsCount: int('followingsCount').default(0),
    followersCount: int('followersCount').default(0),
  },
  table => {
    return {
      walletAddressIndex: uniqueIndex('walletAddressIndex').on(
        table.walletAddress,
      ),
    };
  },
);

export type User = typeof users.$inferSelect;

const generateJWT = (
  id: number,
  walletAddress: string,
  role: string,
  fullName: string,
  profilePhoto: string,
) => {
  const exp = new Date();
  exp.setDate(exp.getDate() + 7);

  return jwt.sign(
    {
      id,
      walletAddress,
      role,
      fullName,
      profilePhoto,
      exp: exp.getTime() / 1000,
    },
    config.secret as string,
  );
};

export const toAuthJSON = (user: User) => {
  return {
    ...user,
    token: generateJWT(
      user.id,
      user.walletAddress,
      user.role as string,
      user.fullName as string,
      user.profilePhoto as string,
    ),
  };
};

//RELATIONS

export const UserRelations = relations(users, ({ one, many }) => {
  return {
    spaces: many(spaces),
    members: many(members),
    posts: many(posts),
    postReactions: many(postReactions),
    comments: many(comments),
    commentReactions: many(commentReactions),
    participants: many(participants),
    messages: many(messages),
    userSpaceRoles: many(userSpaceRoles),
    chatAdmin: many(chats),
  };
});
