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

async function getGame(req: Request, res: Response) {
    try {
        const gameId: string = (req.query?.gameId as string);

        const game = await prisma.game.findFirst(
            {
                where: {
                    id: gameId
                },
                select: {
                    id: true,
                    players: {
                        where: {
                            gameId: gameId
                        },
                        select: {
                            id: true,
                            gameData: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatarUrl: true
                                }
                            }
                        }
                    },
                    winner: {
                        select: {
                            id: true,
                            name: true,
                            avatarUrl: true
                        }
                    },
                    draw: true
                }
            }
        )

        res.status(200)
        .json(
            {
                statusCode: 200,
                success: true,
                message: "Game fetched Successfully",
                data: {
                    game
                }
            }
        );
    } catch (error) {
        console.log(error)
    }
}

export {getAllGames, getGame};