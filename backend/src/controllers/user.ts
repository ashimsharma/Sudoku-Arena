import { Request, Response } from "express";
import prisma from "../db";
import { FriendRequestStatus, GameStatus } from "@prisma/client";

async function getAllGames(req: Request, res: Response) {
	try {
		const user: any = req.user;

		if (!user) {
			res.status(401).json({
				statusCode: 401,
				message: "Unauthorized",
				success: false,
			});
			return;
		}

		const games = await prisma.user.findFirst({
			where: {
				id: user.id,
			},
			select: {
				games: {
					where: {
						game: {
							status: GameStatus.COMPLETED,
						},
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
												avatarUrl: true,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		});

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Games fetched successfully",
			data: { games },
		});
	} catch (error) {
		console.log(error);
	}
}

async function getGame(req: Request, res: Response) {
	try {
		const gameId: string = req.query?.gameId as string;

		const game = await prisma.game.findFirst({
			where: {
				id: gameId,
			},
			select: {
				id: true,
				players: {
					where: {
						gameId: gameId,
					},
					select: {
						id: true,
						gameData: true,
						user: {
							select: {
								id: true,
								name: true,
								avatarUrl: true,
							},
						},
					},
				},
				winner: {
					select: {
						id: true,
						name: true,
						avatarUrl: true,
					},
				},
				draw: true,
			},
		});

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Game fetched Successfully",
			data: {
				game,
			},
		});
	} catch (error) {
		console.log(error);
	}
}

async function getUser(req: Request, res: Response) {
	try {
		const user: any = req.user;

		const userId: string = req.query?.userId as string;

		if (user.id === userId) {
			res.status(200).json({
				statusCode: 200,
				success: true,
				message: "User Profile fetched successfully.",
				data: { isSelf: true },
			});
			return;
		}

		let rank: any[] = await prisma.$queryRaw`
	  SELECT rank FROM (
	    SELECT id, RANK() OVER (
	      ORDER BY "noOfWins"::float / NULLIF(("noOfWins" + "noOfLosses" + "noOfDraws")::float, 0) DESC
	    ) AS rank
	    FROM "User"
	  ) AS ranked
	  WHERE id = ${userId}
	    `;

		const foundUser: any = await prisma.user.findFirst({
			where: {
				id: userId,
			},
			select: {
				id: true,
				name: true,
				avatarUrl: true,
				noOfWins: true,
				noOfDraws: true,
				noOfLosses: true,
                
			},
		});

		if (!foundUser) {
			res.status(402).json({
				statusCode: 402,
				success: false,
				message: "Failed to fetch user.",
			});
			return;
		}

        const totalFriends  = await prisma.friend.findMany(
            {
                where: {
                    status: FriendRequestStatus.ACCEPTED,
                    OR: [
                        {
                            requesterId: foundUser.id
                        },
                        {
                            receiverId: foundUser.id
                        }
                    ]
                }
            }
        )

		foundUser.rank = Number(rank[0].rank);
        foundUser.totalFriends = totalFriends.length;

		const friendRequest = await prisma.friend.findFirst({
			where: {
				OR: [
                    {
                        requesterId: user.id,
                        receiverId: foundUser.id
                    },
                    {
                        requesterId: foundUser.id,
                        receiverId: user.id
                    }
                ]
			},
			select: {
				id: true,
				status: true,
				requesterId: true,
			},
		});

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "User Profile fetched successfully.",
			data: {
				user: foundUser,
				isSelf: false,
				friendRequest: friendRequest,
				isFriend:
					friendRequest?.status === FriendRequestStatus.ACCEPTED
						? true
						: false,
				hasRequested:
					friendRequest?.requesterId === user.id ? true : false
			},
		});
	} catch (error) {
		console.log(error);
	}
}

async function addFriend(req: Request, res: Response) {
	try {
		const user: any = req.user;

		const userId: string = req.body.userId;

        const existingFriendRequest = await prisma.friend.findFirst(
            {
                where: {
                    OR: [
                        {requesterId: user.id},
                        {receiverId: user.id}
                    ]
                }
            }
        )

        if(existingFriendRequest){
            res.status(402)
            .json(
                {
                    statusCode: 402,
                    success: false,
                    message: "Friend Request Failed"
                }
            )
            return;
        }

		const friendRequest = await prisma.friend.create({
			data: {
				requesterId: user.id,
				receiverId: userId,
				status: FriendRequestStatus.PENDING,
			},
		});

		if (!friendRequest) {
			res.status(402).json({
				statusCode: 402,
				success: false,
				message: "Friend Request Send failed.",
			});
            return;
		}

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Friend Request Sent.",
		});
	} catch (error) {
		console.log(error);
	}
}

async function getFriendRequests(req: Request, res: Response) {
	try {
		const user: any = req.user;

		const friendRequests = await prisma.friend.findMany({
			where: {
				receiverId: user.id,
				status: FriendRequestStatus.PENDING,
			},
			select: {
				id: true,
				requester: {
					select: {
						id: true,
						name: true,
						avatarUrl: true,
					},
				},
				createdAt: true,
			},
		});

		if (!friendRequests) {
			res.status(402).json({
				statusCode: 402,
				succes: false,
				message: "Failed to fetch friend requests.",
			});
			return;
		}

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Friend Requests fetched.",
			data: { friendRequests: friendRequests },
		});
	} catch (error) {
		console.log(error);
	}
}

async function acceptFriend(req: Request, res: Response) {
	try {
		const user: any = req.user;

		const requestId = req.body.requestId;

		const friendRequestAccepted = await prisma.friend.update({
			where: {
				id: requestId,
			},
			data: {
				status: FriendRequestStatus.ACCEPTED,
			},
		});

		if (!friendRequestAccepted) {
			res.status(402).json({
				statusCode: 402,
				success: false,
				message: "Failed to accept friend request.",
			});
			return;
		}

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Friend Request Accepted.",
		});
	} catch (error) {
		console.log(error);
	}
}

async function rejectFriend(req: Request, res: Response) {
	try {
		const user = req.user;

		const requestId = req.body.requestId;

		const friendRequestRejected = await prisma.friend.delete({
			where: {
				id: requestId,
			}
		});

		if (!friendRequestRejected) {
			res.status(402).json({
				statusCode: 402,
				success: false,
				message: "Failed to reject friend request.",
			});
			return;
		}

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Friend Request Reject.",
		});
	} catch (error) {
		console.log(error);
	}
}

async function removeFriend(req: Request, res: Response) {
	try {
		const user: any = req.user;

		const requestId = req.body.requestId;

        const existingFriendRequest = await prisma.friend.findFirst(
            {
                where: {
                    OR: [
                        {requesterId: user.id},
                        {receiverId: user.id}
                    ]
                }
            }
        )

        if(!existingFriendRequest){
            res.status(402)
            .json(
                {
                    statusCode: 402,
                    success: false,
                    message: "Failed to remove friend."
                }
            )
            return;
        }
		const friendRemoved = await prisma.friend.delete({
			where: {
				id: requestId,
			}
		});

		if (!friendRemoved) {
			res.status(402).json({
				statusCode: 402,
				success: false,
				message: "Failed to remove friend.",
			});
			return;
		}

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Friend removed.",
		});
	} catch (error) {
		console.log(error);
	}
}

async function getFriends(req: Request, res: Response) {
	try {
		const user: any = req.user;

		let friends = await prisma.friend.findMany({
			where: {
				OR: [
					{receiverId: user?.id},
					{requesterId: user?.id}
				],
				status: FriendRequestStatus.ACCEPTED,
			},
			select: {
				id: true,
				requester: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				},
				receiver: {
					select: {
						id: true,
						name: true,
						avatarUrl: true
					}
				},
				createdAt: true,
			},
		});

		if (!friends) {
			res.status(402).json({
				statusCode: 402,
				succes: false,
				message: "Failed to fetch friend list.",
			});
			return;
		}	

		res.status(200).json({
			statusCode: 200,
			success: true,
			message: "Friend List fetched.",
			data: { friends: friends },
		});
	} catch (error) {
		console.log(error);
	}
}

async function getActiveGames(req: Request, res: Response) {
	try {
		const user: any = req.user;

		const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

		const foundGame = await prisma.game.findFirst(
			{
				where: {
					players: {
						some: {
							userId: user?.id
						}
					},
					createdAt: {
						gte: oneHourAgo
					},
					status: GameStatus.ACTIVE
				},
				select: {
					id: true,
					players: {
						select: {
							id: true,
							user: {
								select: {
									id: true,
									name: true,
									avatarUrl: true
								}
							}
						}
					}
				},
				orderBy: {
					createdAt: "desc"
				}
			}
		);

		if(!foundGame){
			res.status(402).json(
				{
					statusCode: 402,
					success: false,
					message: "No Active Game Found."
				}
			)
			return;
		}

		res.status(200)
		.json(
			{
				statusCode: 200,
				success: true,
				message: "Active Game Fetched.",
				data: {game: foundGame}
			}
		)
	} catch (error) {
		console.log(error);
	}
}

async function exitGame(req: Request, res: Response) {
	try {
		const user: any = req.user;
		const opponentId = req.body.opponentId;
		const gameId = req.body.gameId;

		const updateGame = await prisma.game.update(
			{
				where: {
					id: gameId
				},
				data: {
					winnerId: opponentId,
					status: GameStatus.COMPLETED,
					draw: false
				}
			}
		)

		const updateUser = await prisma.user.update(
			{
				where: {
					id: user?.id
				},
				data: {
					noOfLosses: {
						increment: 1
					}
				}
			}
		);

		const updateOpponent = await prisma.user.update(
			{
				where: {
					id: opponentId
				},
				data: {
					noOfWins: {
						increment: 1
					}
				}
			}
		)


		res.status(200)
		.json(
			{
				statusCode: 200,
				success: true,
				message: "Game Exited"
			}
		)
	} catch (error) {
		console.log(error);
	}
}
export {
	getAllGames,
	getGame,
	getUser,
	addFriend,
	getFriendRequests,
	acceptFriend,
	rejectFriend,
    removeFriend,
	getFriends,
	getActiveGames,
	exitGame
};
