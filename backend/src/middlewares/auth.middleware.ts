import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db";

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const accessToken = req.cookies?.sudoku_arena_access_token;

		if (!accessToken) {
			res.status(401).json({
				statusCode: 401,
				success: false,
				message: "Token not provided.",
			});
            return;
		}

		let decodedToken: JwtPayload | undefined;

		try {
			decodedToken = jwt.verify(
				accessToken,
				process.env.ACCESS_TOKEN_SECRET as string
			) as JwtPayload;
		} catch (error) {
			decodedToken = undefined;
		}

		if (!decodedToken?.id) {
			res.status(401).json({
				statusCode: 401,
				success: false,
				message: "Unauthorized request.",
			});
            return;
		}

		let user = await prisma.user.findFirst({
			where: { id: decodedToken.id },
		});

		if (!user) {
			res.status(401).json({
				statusCode: 404,
				success: false,
				message: "User not found.",
			});
            return;
		}

		req.user = user;

		next();
	} catch (error: any) {
		throw new Error(error.message);
	}
};

export default verifyJWT;
