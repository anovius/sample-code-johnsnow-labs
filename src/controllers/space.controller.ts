import { Request, Response } from 'express'
import { db } from '@database/index'
import { members, spaces, topics, subtopics, users, spaceRoles, userSpaceRoles, notifications, notificationSettings, privateSubtopicAccess, spaceSettings } from '@database/schema'
import { and, desc, eq, like, sql } from 'drizzle-orm'
import slug from 'slug'
import { onCreateSetupReadStatus, onJoinSetupReadStatus } from '@helper/subtopic'


const create = async ( req: Request, res: Response ) => {
    const { name, projectDescription, profilePhoto, coverPhoto, blockchain, contractAddress, keywords, links } = req.body
    try {
        const space = await db.insert( spaces ).values( {
            slug: slug( "" + name, { lower: true } ),
            name,
            projectDescription,
            profilePhoto,
            coverPhoto,
            adminWalletAddress: req.body.payload.walletAddress,
            blockchain,
            contractAddress,
            keywords,
            links,
            status: "approved"
        } )

        //Background jobs after space creation seeding default data
        setImmediate( async () => {
            await db.insert( members ).values( {
                userId: req.body.payload.id,
                spaceId: space[ 0 ].insertId
            } )

            const topic = await db.insert( topics ).values( {
                name: "Main",
                spaceId: space[ 0 ].insertId
            } )

            await db.insert( subtopics ).values( {
                name: "General",
                topicID: topic[ 0 ].insertId,
                emoji: "💬"
            } )

            const role = await db.insert( spaceRoles ).values( {
                spaceId: space[ 0 ].insertId,
                name: "Members",
                color: "#FF0000",
                viewModerateSubChannel: true,
                createInvite: false,
                kickMembers: false,
                banMembers: false,
                pinMessages: false,
                sendMessages: true,
                createPublicThreads: true,
                embeddedLinks: true,
                attachFiles: true,
                addReactions: true,
                sendVoiceMessages: false
            } )

            await db.update( spaces ).set( { defaultRoleId: role[ 0 ].insertId } ).where( eq( spaces.id, space[ 0 ].insertId ) );
        } )

        return res.status( 200 ).json( {
            message: "Space created",
            data: space
        } )

    }
    catch ( e: any ) {
        return res.status( 400 ).json( {
            message: e.message
        } )
    }
}

const getSpaceRoles = async ( req: Request, res: Response ) => {
    const spaceId = parseInt( req.params.space );
    if ( !spaceId ) {
        return res.status( 400 ).json( {
            message: "Invalid ID"
        } )
    }

    try {

        const space = await db.select().from( spaces ).where( eq( spaces.id, spaceId ) );
        if ( space.length === 0 ) {
            return res.status( 400 ).json( {
                message: "Space not found"
            } )
        }

        if ( req.body.payload.walletAddress !== space[ 0 ].adminWalletAddress ) {
            return res.status( 400 ).json( {
                message: "You are not allowed to view roles"
            } )
        }

        const allRoles = await db.select().from( spaceRoles ).where( eq( spaceRoles.spaceId, spaceId ) );
        return res.status( 200 ).json( {
            message: "Roles fetched successfully",
            data: allRoles
        } );

    }
    catch ( e: any ) {
        return res.status( 400 ).json( {
            message: e.message
        } )
    }
}

const assignSpaceRoles = async ( req: Request, res: Response ) => {
    const {
        userId,
        spaceId,
        spaceRoleId
    } = req.body;

    if ( !userId || !spaceId || !spaceRoleId ) {
        return res.status( 400 ).json( {
            message: "User ID, Space ID and Role ID are required"
        } )
    }

    try {
        const space = await db.select().from( spaces ).where( eq( spaces.id, spaceId ) );
        if ( space.length === 0 ) {
            return res.status( 400 ).json( {
                message: "Space not found"
            } )
        }

        if ( req.body.payload.walletAddress !== space[ 0 ].adminWalletAddress ) {
            return res.status( 400 ).json( {
                message: "You are not allowed to assign roles"
            } )
        }


        const findUserSpaceRole = await db.select().from( userSpaceRoles ).where( and( eq( userSpaceRoles.spaceId, spaceId ), eq( userSpaceRoles.userId, userId ) ) )

        console.log( "findUserSpaceRole", findUserSpaceRole[ 0 ] )

        if ( findUserSpaceRole ) {
            const result = await db.update( userSpaceRoles ).set( {
                spaceRoleId
            } ).where( and( eq( userSpaceRoles.spaceId, spaceId ), eq( userSpaceRoles.userId, userId ) ) )

            return res.status( 200 ).json( {
                message: "Role assigned",
                data: { id: result[ 0 ].insertId }
            } );

        }

        const result = await db.insert( userSpaceRoles ).values( {
            userId,
            spaceId,
            spaceRoleId
        } );

        return res.status( 200 ).json( {
            message: "Role assigned",
            data: { id: result[ 0 ].insertId }
        } );
    }
    catch ( e: any ) {
        return res.status( 400 ).json( {
            message: e.message
        } )
    }
}

const setDefaultSpaceRole = async ( req: Request, res: Response ) => {
    const {
        spaceId,
        spaceRoleId
    } = req.body;

    if ( !spaceId || !spaceRoleId ) {
        return res.status( 400 ).json( {
            message: "Space ID and Role ID are required"
        } )
    }

    try {
        const space = await db.select().from( spaces ).where( eq( spaces.id, spaceId ) );
        if ( space.length === 0 ) {
            return res.status( 400 ).json( {
                message: "Space not found"
            } )
        }

        if ( req.body.payload.walletAddress !== space[ 0 ].adminWalletAddress ) {
            return res.status( 400 ).json( {
                message: "You are not allowed to assign roles"
            } )
        }

        await db.update( spaces ).set( { defaultRoleId: spaceRoleId } ).where( eq( spaces.id, spaceId ) );

        return res.status( 200 ).json( {
            message: "Default role set"
        } );
    }
    catch ( e: any ) {
        return res.status( 400 ).json( {
            message: e.message
        } )
    }
}


export default {
    create,
   
    createSpaceRole,
    updateSpaceRole,
    getSpaceRoles,
    assignSpaceRoles,
    setDefaultSpaceRole,
} 