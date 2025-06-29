import { Request, Response } from "express";
import prisma from "../db";

async function getAllGames(req: Request, res: Response){
    try {
        const user: any = req.user;
    
        if(!user){
            res.status(401)
            .json(
                {
                    statusCode: 401,
                    message: "Unauthorized",
                    success: false
                }
            )
            return;
        }
    
        const games = await prisma.user.findFirst(
            {
                where: {
                    id: user.id
                },
                select: {
                    games: {
                        where: {
                            game: {
                                status: 'COMPLETED'
                            }
                        },
                        select: {
                            game: {
                                select: {
                                    winner: true,
                                    options: true,
                                    draw: true,
                                    id: true,
                                    createdAt: true,
                                    players: {
                                        select: {
                                            user: {
                                                select: {
                                                    id: true,
                                                    name: true,
                                                    avatarUrl: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        )
    
        res.status(200)
        .json(
            {
                statusCode: 200,
                success: true,
                message: "Games fetched successfully",
                data: {games}
            }
        )
    } catch (error) {
        console.log(error);
    }
}

export {getAllGames};