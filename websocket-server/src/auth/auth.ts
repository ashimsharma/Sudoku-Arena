import { IncomingMessage } from "http";
import { parse } from "url";
import jwt from "jsonwebtoken";
import prisma from "../db/index";
import { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  id: string;
}

export const authenticate = async (request: IncomingMessage) => {
  const { token } = parse(request.url as string, true).query;

  if (!token) {
    return { authenticated: false, message: "Token is missing" };
  }

  try {
    const decoded = jwt.verify(
      token as string,
      process.env.JWT_SECRET as string
    ) as DecodedToken;

    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      return { authenticated: false, message: "Invalid or expired token" };
    }

    return { authenticated: true, id: decoded.id };
  } catch (error) {
    return { authenticated: false, message: "Invalid or expired token" };
  }
};
