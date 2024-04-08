import { acentualCorrection } from "./types";
import { Connection } from "@planetscale/database";
import { getUserId } from "../../user/application/getUser";
import { uploadScore } from "./uploadScore";
import { Optional } from "../../shared/types";
import { authenticateJWT } from "../../shared/authenticateJWT";



export async function uploadAnswers(corrections: acentualCorrection[],
                                    gameSession: string,
                                    token: string | null,
                                    score: number,
                                    start_date: Date,
                                    difficulty: number,
                                    env: Bindings,
                                    db: Connection): Promise<Optional<string>> {
  if (!token) { 
    const uploadAnswersQuery = await db.execute(`INSERT INTO Answer (session_id, user_id, answer_value, game_type_id, game_id) VALUES ${corrections.map(e=> `("${gameSession}", 0, ${e.user_answer_value}, 2, ${e.game_id})`).join(",")}`)
    const uploadScoreQuery = await uploadScore(gameSession, 0, score, start_date, difficulty, db)
    if (!uploadScoreQuery.content) {
      return {
        message: uploadScoreQuery.message,
        content: null
      }
    }
    return {
      message: "Answers stored as anonymous/guest",
      content: uploadScoreQuery.content
    }
  }
  const userData = await authenticateJWT(token, env)

  if (!userData.content) {
    return {
      message: userData.message,
      content: null
    }
  }

  const uploadAnswersQuery = await db.execute(`INSERT INTO Answer
                                              (session_id,user_id, answer_value, game_type_id, game_id)
                                              VALUES 
                                              ${corrections.map(e=> `("${gameSession}", ${userData.content!.user_id}, ${e.user_answer_value}, 2, ${e.game_id})`).join(",")}`)
  if (uploadAnswersQuery.rowsAffected == 0) {
    return {
      message: "Couldn't store answers",
      content: null
    }
  }

  const uploadScoreQuery = await uploadScore(gameSession, userData.content.user_id, score, start_date, difficulty, db)
  if (!uploadScoreQuery.content) {
    return {
      message: "Couldn't store score",
      content: null
    }
  }

  return {
    message: "Answers stored successfully by user",
    content: uploadScoreQuery.content
  }
}