import { Connection } from "@planetscale/database"
import { sessionScoreResponse } from "./types"
import { authenticateJWT } from "../../shared/authenticateJWT";
import { loginWithTokenSchema } from "../../shared/schemas";



export async function getPlayerHistory(body: any, env: Bindings, db: Connection) {
  const bodyValidation = loginWithTokenSchema.safeParse(body)
  if (!bodyValidation.success) {
    return {
      success: false,
      message: bodyValidation.error.toString(),
      payload: null
    }
  }


  const userData = await authenticateJWT(bodyValidation.data.token, env)
  if (!userData.content) {
    return {
      success: false,
      message: "Invalid token",
      payload: null
    }
  }

  const history = await getPlayerSessions(userData.content.user_id, db);

  return {
    success: true,
    message: "Leaderboard retrieved successfully",
    payload: history
  }
}


export async function getPlayerSessions(userId: number, db: Connection) {
  const query = `SELECT session_id,
                        score,
                        answer_time,
                        game_id,
                        difficulty
                        FROM SessionScore
                        WHERE user_id = ${userId}
                        ORDER BY creation_date DESC`

  const sessions = (await db.execute(query)).rows as sessionScoreResponse[]

  const sessionsPerGame: sessionScoreResponse[][] = [[], [], []]

  for (let i = 0; i < sessions.length; i++) {
    sessionsPerGame[sessions[i].game_id - 1].push(sessions[i]);
  }
  
  return sessionsPerGame;

}

  
