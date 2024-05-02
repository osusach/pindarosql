import { Optional, silabaCorrection } from "../../shared/types";
import { Client } from "@libsql/client/web";
import { getUserId } from "../../user/application/getUser";
import { uploadScore } from "./uploadScore";
import { authenticateJWT } from "../../shared/authenticateJWT";



export async function uploadAnswers(corrections: silabaCorrection[],
                                    gameSession: string,
                                    token: string | null,
                                    score: number,
                                    start_date: Date,
                                    difficulty: number,
                                    env: Bindings,
                                    db: Client): Promise<Optional<string>> {
  if (!token) { 
    const uploadAnswersQuery = await db.execute(`INSERT INTO Answer (session_id, user_id, answer_value, game_type_id, game_id) VALUES ${corrections.map(e=> `("${gameSession}", 0, ${e.user_answer_value}, 1, ${e.game_id})`).join(",")}`)
    const uploadScoreQuery = await uploadScore(gameSession,
                                               0,
                                               score,
                                               start_date,
                                               difficulty,
                                               db)

    if (!uploadScoreQuery.content) {
      return {
        content: null,
        message: uploadScoreQuery.message
      }
    }
    return {
      content: uploadScoreQuery.content,
      message: "Answers stored as anonymous/guest"
      
    }
  }
  const userData = await authenticateJWT(token, env)
  if (!userData.content) {
    return {
      content: null,
      message: userData.message
    }
  }
const uploadAnswersQuery = await db.execute(`INSERT INTO Answer (session_id, user_id, answer_value, game_type_id, game_id) VALUES ${corrections.map(e=> `("${gameSession}", ${userData.content!.user_id}, ${e.user_answer_value}, 1, ${e.game_id})`).join(",")}`)
  if (uploadAnswersQuery.rowsAffected == 0) {
    return {
      message: "Couldn't store answers",
      content: null
    }
  }

  const uploadScoreQuery = await uploadScore(gameSession,
                                             userData.content!.user_id,
                                             score,
                                             start_date,
                                             difficulty,
                                             db)
  if (!uploadScoreQuery.content) {
    return {
      content: null,
      message: "Couldn't store score"
    }
  }
  return {
    message: "Answers stored successfully by user",
    content: uploadScoreQuery.content
  }
}