import { CookieOptions, NextFunction, Request, Response } from "express";
import passport, { use } from "passport";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../db";
import { FriendRequestStatus } from "@prisma/client";

function githubLogin(req: Request, res: Response, next: NextFunction) {
	passport.authenticate("github", { scope: ["user"] })(req, res, next);
}

interface User {
	id: string;
	email: string;
	avatarUrl: string;
	name: string;
}

async function githubLoginCallback(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		if (!req.user) {
			res.redirect(process.env.GITHUB_FAILURE_REDIRECT as string);
			return;
		}

		const payload = { id: (req.user as User).id };

		const accessToken = jwt.sign(
			payload,
			process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
			{
				expiresIn: "15M",
			}
		);

		const refreshToken = jwt.sign(
			payload,
			process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
			{
				expiresIn: "90D",
			}
		);

		await prisma.user.update({
			where: {
				id: (req.user as User)?.id,
			},
			data: {
				refreshToken: refreshToken,
			},
		});

		const accessTokenOptions: CookieOptions = {
			httpOnly: true,
			secure: true,
			maxAge: 15 * 60 * 1000,
			sameSite: "none",
		};

		const refreshTokenOptions: CookieOptions = {
			httpOnly: true,
			secure: true,
			maxAge: 90 * 24 * 60 * 60 * 1000,
			sameSite: "none",
		};

		res.cookie(
			"sudoku_arena_access_token",
			accessToken,
			accessTokenOptions
		);
		res.cookie(
			"sudoku_arena_refresh_token",
			refreshToken,
			refreshTokenOptions
		);

		res.redirect(process.env.CLIENT_URL as string);
	} catch (error) {
		console.log(error);
	}
}

function googleLogin(req: Request, res: Response, next: NextFunction) {
	passport.authenticate("google", { scope: ["profile", "email"] })(
		req,
		res,
		next
	);
}

async function googleLoginCallback(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		if (!req.user) {
			res.redirect(process.env.GOOGLE_FAILURE_REDIRECT as string);
			return;
		}

		const payload = { id: (req.user as User).id };

		const accessToken = jwt.sign(
			payload,
			process.env.ACCESS_TOKEN_SECRET as jwt.Secret,
			{
				expiresIn: "15M",
			}
		);
		const refreshToken = jwt.sign(
			payload,
			process.env.REFRESH_TOKEN_SECRET as jwt.Secret,
			{
				expiresIn: "90D",
			}
		);

		await prisma.user.update({
			where: {
				id: (req.user as User)?.id,
			},
			data: {
				refreshToken: refreshToken,
			},
		});

		const accessTokenOptions: CookieOptions = {
			httpOnly: true,
			secure: true,
			maxAge: 15 * 60 * 1000,
			sameSite: "none",
		};

		const refreshTokenOptions: CookieOptions = {
			httpOnly: true,
			secure: true,
			maxAge: 90 * 24 * 60 * 60 * 1000,
			sameSite: "none",
		};

		res.cookie(
			"sudoku_arena_access_token",
			accessToken,
			accessTokenOptions
		);
		res.cookie(
			"sudoku_arena_refresh_token",
			refreshToken,
			refreshTokenOptions
		);

		res.redirect(process.env.CLIENT_URL as string);
	} catch (error) {
		console.log(error);
	}
}

function isAuthenticated(req: Request, res: Response) {
	if (req.user) {
		res.status(200).json({
			statusCode: 200,
			data: { user: req.user },
			success: true,
			message: "Autheticated.",
		});
	}
}

async function refreshAccessToken(req: Request, res: Response) {
	try {
		const token =
			req.cookies?.sudoku_arena_refresh_token ||
			(req.headers["Authorization"] as string)?.replace("Bearer ", "");

		let decodedToken: JwtPayload | undefined;

		try {
			decodedToken = jwt.verify(
				token,
				process.env.REFRESH_TOKEN_SECRET as string
			) as JwtPayload;
		} catch (error) {
			decodedToken = undefined;
		}

		if (!decodedToken) {
			res.status(401).json({
				statusCode: 401,
				success: false,
				message: "Unauthorized request.",
			});
			return;
		}

		let user = await prisma.user.findFirst({
			where: { id: decodedToken?.id },
		});

		if (!user) {
			res.status(401).json({
				statusCode: 404,
				success: false,
				message: "User not found.",
			});
			return;
		}

		if (!user.refreshToken === token) {
			res.status(401).json({
				statusCode: 404,
				success: false,
				message: "Invalid Refresh Token.",
			});
			return;
		}

		const payload = { id: (req.user as User)?.id };

		const accessTokenOptions: CookieOptions = {
			httpOnly: true,
			secure: true,
			maxAge: 15 * 60 * 1000,
			sameSite: "none",
		};

		const newAccessToken = jwt.sign(
			payload,
			process.env.ACCESS_TOKEN_SECRET as string
		);

		res.cookie(
			"sudoku_arena_access_token",
			newAccessToken,
			accessTokenOptions
		).json({
			success: true,
			statusCode: 200,
			message: "Access Token Refreshed.",
		});
	} catch (error) {
		console.log(error);
	}
}
async function getProfile(req: Request, res: Response) {
	try {
		const user: any = req.user;

		const result: any[] = await prisma.$queryRaw`
	  SELECT rank FROM (
	    SELECT id, RANK() OVER (
	      ORDER BY "noOfWins"::float / NULLIF(("noOfWins" + "noOfLosses" + "noOfDraws")::float, 0) DESC
	    ) AS rank
	    FROM "User"
	  ) AS ranked
	  WHERE id = ${(req.user as any).id}
	`;

		if (!result) {
			res.status(401).json({
				statusCode: 401,
				message: "Failed to fetch rank.",
				success: false,
			});

			return;
		}

		const totalFriends = await prisma.friend.findMany({
			where: {
				status: FriendRequestStatus.ACCEPTED,
				OR: [
					{
						requesterId: user.id,
					},
					{
						receiverId: user.id,
					},
				],
			},
		});

		user.rank = Number(result[0].rank);
		user.totalFriends = totalFriends.length;

		res.status(200).json({
			statusCode: 200,
			success: true,
			data: { user: user },
			message: "Profile fetched successfully.",
		});
	} catch (error) {
		console.log(error);
	}
}

async function logout(req: Request, res: Response) {
	try {
		const user = req?.user;

		const userUpdate = await prisma.user.update({
			where: {
				id: (user as User)?.id,
			},
			data: {
				refreshToken: null,
			},
		});

		if (!userUpdate) {
			res.status(500).json({
				sttausCode: 500,
				success: false,
				message: "Internal Server Error",
			});
		}

		res.status(200)
			.clearCookie("sudoku_arena_access_token")
			.clearCookie("sudoku_arena_refresh_token")
			.json({
				statusCode: 200,
				success: true,
				message: "Logout Successful",
			});
	} catch (error) {
		console.log(error);
	}
}
export {
	githubLogin,
	githubLoginCallback,
	googleLogin,
	googleLoginCallback,
	isAuthenticated,
	getProfile,
	refreshAccessToken,
	logout,
};
