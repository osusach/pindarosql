import { rimaCorrection } from "./types";
import { Client } from "@libsql/client/web";
import { getUserId } from "../../user/application/getUser";
import { uploadScore } from "./uploadScore";
import jwt from "@tsndr/cloudflare-worker-jwt"
import { Optional } from "../../shared/types";



export async function uploadAnswers(corrections: rimaCorrection[],
                                    gameSession: string,
                                    token: string | null,
                                    score: number,
                                    start_date: Date,
                                    difficulty: number,
                                    env: Bindings,
                                    db: Client): Promise<Optional<string>> {
  if (!token) { 
    const uploadAnswersQuery = await db.execute(`INSERT INTO Answer (session_id, user_id, answer_value, game_type_id, game_id) VALUES ${corrections.map(e=> `("${gameSession}", 0, ${e.user_answer_value}, 3, ${e.game_id})`).join(",")}`)
    const uploadScoreQuery = await uploadScore(gameSession, 0, score, start_date, difficulty, db)
    if (!uploadScoreQuery.content) {
      return {
        message: uploadScoreQuery.message,
        content: null
      }
    }
    return {
      message: "Answers stored as anonymous/guest",
      content: uploadScoreQuery.content! 
      
    }
  }
  const isValid = await jwt.verify(token, env.JWT_KEY)

  if (!isValid) {
    return {
      message: "JWT received is not valid",
      content: null
    }
  }

  const { payload } = jwt.decode(token)
  const uploadAnswersQuery = await db.execute(`INSERT INTO Answer (session_id, user_id, answer_value, game_type_id, game_id) VALUES ${corrections.map(e=> `("${gameSession}", ${payload!["user_id"]}, ${e.user_answer_value}, 3, ${e.game_id})`).join(",")}`)
  if (uploadAnswersQuery.rowsAffected == 0) {
    return {
      message: "Couldn't store answers",
      content: null
    }
  }

  const uploadScoreQuery = await uploadScore(gameSession, payload!["user_id"], score, start_date, difficulty, db)
  if (!uploadScoreQuery.content) {
    return {
      message: "Couldn't store score",
      content: null
    }
  }
  return {
    message: "Answers stored successfully by user",
    content: uploadScoreQuery.content!
  }
}