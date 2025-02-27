import { PrismaClient, GameStatus } from "@prisma/client";

const prisma = new PrismaClient();

export  {prisma, GameStatus};