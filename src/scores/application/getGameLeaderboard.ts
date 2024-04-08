import { Connection } from "@planetscale/database";


export async function getGameLeaderboard(gameId: number, maxEntries: number, db: Connection) {
  const leaderboard = await db.execute(`
  SELECT User.name, SessionScore.score, SessionScore.answer_time FROM GameSession INNER JOIN SessionScore ON GameSession.id = SessionScore.session_id INNER JOIN User ON SessionScore.user_id = User.id WHERE GameSession.game_type_id = ${gameId} ORDER BY SessionScore.score DESC LIMIT ${maxEntries};`)

  return {
    success: true,
    message: "Leaderboard retrieved successfully",
    payload: leaderboard.rows as {name: string, score: number, answer_time: string}[]
  }
}