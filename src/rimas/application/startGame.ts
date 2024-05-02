import { Client } from "@libsql/client/web"
import { getRimas } from "./getRimas"
import { rimaQuestion } from "./types"
import { selectSchema } from "./optionSchemas"
import { createSession } from "../../shared/createSession"
import { addRimasToSession } from "./addRimasToSession"





export async function startGame(difficulty: number, db: Client) {
  let rimaSets = await getRimas(10, db)
  if (!rimaSets.content) {
    return {
      success: false,
      message: rimaSets.message,
      payload: null
    }
  }

  // 3 FOR RIMAS GAME
  const session = await createSession(difficulty, 3, db)
  if (!session.success || !session.payload.session_id) {
    return {
      success: false,
      message: session.payload.message,
      payload: null
    }
  }

  const optionSchema = selectSchema(difficulty)
  const game = await addRimasToSession(session.payload.session_id, rimaSets.content, optionSchema.schemaId, db)
  
  if (!game.content) {
    return {
      success: false,
      message: game.message,
      payload: null
    }
  }

  
  const acentualQuestions: rimaQuestion[] = game.content.map(e => {
    return {
            game_id: e.game_id,
            word_a_id: e.rhyme_a.id,
            word_b_id: e.rhyme_b.id,
            word_a: e.rhyme_a.word,
            word_b: e.rhyme_b.word,
            options: optionSchema.options, 
            option_schema_id: optionSchema.schemaId
    }
  })

  

  return {
    success: true,
    message: "Game created successfully",
    payload: {
      session_id: session.payload.session_id,
      questions: acentualQuestions
    }
  }
}