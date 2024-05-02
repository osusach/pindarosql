import { Client } from "@libsql/client/web";
import { dbQuery } from "../../shared/dbQuery";


export async function getGameLeaderboard(gameId: number, maxEntries: number, db: Client) {
  const leaderboardQuery = `SELECT User.name, SessionScore.score, SessionScore.answer_time FROM GameSession INNER JOIN SessionScore ON GameSession.id = SessionScore.session_id INNER JOIN User ON SessionScore.user_id = User.id WHERE GameSession.game_type_id = ${gameId} ORDER BY SessionScore.score DESC LIMIT ${maxEntries};`
  const leaderboard = await dbQuery<{name: string, score: number, answer_time: string}>(leaderboardQuery, db)

  return {
    success: true,
    message: "Leaderboard retrieved successfully",
    payload: leaderboard.success ? leaderboard.data : null
  }
}