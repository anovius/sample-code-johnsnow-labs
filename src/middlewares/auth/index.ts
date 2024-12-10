import config from "@config/index";
import { NextFunction, Request, Response } from "express";
import jwt from 'jsonwebtoken';
import { db } from "@database/index";
import { users } from "@database/schema";
import { eq } from "drizzle-orm";

const getTokenFromHeader = (req: Request) => {
    if(req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
        return req.headers.authorization.split(" ")[1];
    }
    return null;
}

const required = async (req: Request, res: Response, next: NextFunction) => {
    const token = getTokenFromHeader(req);
    if(!token) {
        return res.status(401).json({
            message: "No authorization token found!"
        });
    }

    try{
        const payload = jwt.verify(token, config.secret as string) as {id: number, walletAddress: string, exp: number, role: string, fullName: string, profilePhoto: string};
        req.body.payload = {id: payload.id, walletAddress: payload.walletAddress, role: payload.role, fullName: payload.fullName, profilePhoto: payload.profilePhoto};
        return next();
    }
    catch(err) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
};

const user = async (req: Request, res: Response, next: NextFunction) => {
    const { walletAddress } = req.body.payload;
    const user = await db.select().from(users).where(eq(users.walletAddress, walletAddress));
    if(user.length === 0) {
        return res.status(401).json({
            message: "User not found"
        });
    }
    req.user = user[0];
    return next();
};

const admin = async (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.body.payload;
    if(role !== "ADMIN") {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }
    return next();
};

export default {
    required,
    user,
    admin
};