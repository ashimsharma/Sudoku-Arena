import { IncomingMessage } from "http";
import { parse } from "url";
import jwt from "jsonwebtoken";
import { prisma } from "../db/index";
import { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
	id: string;
}

export const authenticate = async (request: IncomingMessage) => {
	const cookieHeader = request.headers.cookie;

	const cookies = parseCookies(cookieHeader);

	const token = cookies?.sudoku_arena_access_token;

	if (!token) {
		return { success: false, message: "Token is missing" };
	}

	try {
		const decoded = jwt.verify(
			token as string,
			process.env.ACCESS_TOKEN_SECRET as string
		) as DecodedToken;

		const user = await prisma.user.findFirst({
			where: {
				id: decoded.id,
			},
		});

		if (!user) {
			return {
				authenticated: false,
				message: "Invalid or expired token",
			};
		}

		return { authenticated: true, id: decoded.id };
	} catch (error) {
		return { authenticated: false, message: "Invalid or expired token" };
	}
};

const parseCookies = (cookies: string | undefined) => {
	if (!cookies) return {};
	return Object.fromEntries(
		cookies.split(";").map((cookie) => cookie.trim().split("="))
	);
};
