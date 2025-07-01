import { Request, Response } from "express";
import getTimeRange from "../utils/timeRanges";
import prisma from "../db";

type TimeRangeTypes = "allTime" | "daily" | "weekly" | "monthly";

async function getLeaderboard(req: Request, res: Response) {
	try {
		const type: TimeRangeTypes =
			(req.query?.type as TimeRangeTypes) || "allTime";

		const timeRange = getTimeRange(type);

		const whereClause = timeRange
			? { createdAt: { gte: timeRange.start, lte: timeRange.end } }
			: {};

		const games = await prisma.game.findMany({
			where: whereClause,
			select: {
				winnerId: true,
				createdAt: true,
				players: {
					select: {
						userId: true,
					},
				},
			},
		});

		const stats = new Map<
			string,
			{ wins: number; losses: number; draws: number; total: number }
		>();

		for (const game of games) {
			const playerIds = game.players.map((p) => p.userId);
			const winnerId = game.winnerId;

			if (playerIds.length === 2) {
				for (const playerId of playerIds) {
					const entry = stats.get(playerId) || {
						wins: 0,
						losses: 0,
						draws: 0,
						total: 0,
					};

					entry.total += 1;

					if (!winnerId) {
						entry.draws += 1;
					} else if (playerId === winnerId) {
						entry.wins += 1;
					} else {
						entry.losses += 1;
					}

					stats.set(playerId, entry);
				}
			}
		}

		const users = await prisma.user.findMany({
			where: {
				id: { in: Array.from(stats.keys()) },
			},
			select: {
				id: true,
				name: true,
				avatarUrl: true,
			},
		});

		const leaderboard = users
			.map((user: any) => {
				const { wins, losses, draws, total } = stats.get(user.id)!;
				const winRatio = total > 0 ? wins / total : 0;

				return {
					id: user.id,
					name: user.name,
					avatarUrl: user.avatarUrl,
					wins,
					losses,
					draws,
					total,
					winRatio: parseFloat(winRatio.toFixed(2)),
				};
			})
			.sort((a: any, b: any) =>
				b.winRatio !== a.winRatio
					? b.winRatio - a.winRatio
					: b.wins - a.wins
			)
			.slice(0, 10);
        
        res.status(200)
        .json(
            {
                message: "Leaderboard fetched successfully.",
                data: {leaderboard},
                success: true
            }
        )
        return;
	} catch (error) {
		console.log(error);
	}
}

export {getLeaderboard};