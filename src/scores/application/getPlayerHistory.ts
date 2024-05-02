import { Client } from "@libsql/client/web";
import { sessionScoreResponse } from "./types"
import { authenticateJWT } from "../../shared/authenticateJWT";
import { loginWithTokenSchema } from "../../shared/schemas";
import { dbQuery } from "../../shared/dbQuery";



export async function getPlayerHistory(body: any, env: Bindings, db: Client) {
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


export async function getPlayerSessions(userId: number, db: Client) {
  const query = `SELECT session_id,
                        score,
                        answer_time,
                        game_id,
                        difficulty
                        FROM SessionScore
                        WHERE user_id = ${userId}
                        ORDER BY creation_date DESC`

  const sessions = await dbQuery<sessionScoreResponse>(query, db)
  if (!sessions.success) {
    return null
  }

  const sessionsPerGame: sessionScoreResponse[][] = [[], [], []]


  for (let i = 0; i < sessions.data.length; i++) {
    sessionsPerGame[sessions.data[i].game_id - 1].push(sessions.data[i]);
  }
  
  return sessionsPerGame;

}

  
