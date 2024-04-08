import { Connection } from "@planetscale/database";
import { getGameLeaderboard } from "./getGameLeaderboard";

export async function getLeaderboards(db: Connection) {
  let silabaLeaderboard = getGameLeaderboard(1, 10, db)
  let acentualLeaderboard = getGameLeaderboard(2, 10, db)
  let rimasLeaderboard = getGameLeaderboard(3, 10, db)

  return {
    success: true,
    message: "Leaderboards retrieved successfully",
    payload: {
      silabaLeaderboard: (await silabaLeaderboard).payload,
      acentualLeaderboard: (await acentualLeaderboard).payload,
      rimasLeaderboard: (await rimasLeaderboard).payload
    }
  }
}