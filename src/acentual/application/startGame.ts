import type { Connection } from "@planetscale/database";

import { createSession } from "../../shared/createSession"
import { acentualQuestion } from "./types"
import { addAcentualesToSession } from "./addAcentualesToSession"
import { getAcentuales } from "./getAcentuales"
import { selectSchema } from "./optionSchemas"

export async function startGame(difficulty: number, db: Connection) {
  let rows = await getAcentuales(difficulty, 10, db)
  if (!rows.content) {
    return {
      success: false,
      message: rows.message,
      payload: null
    }
  }
  console.log("Acentuales obtenidos")

  const acentualQuestions: acentualQuestion[] = rows.content.map(e => {
    const schema = selectSchema(e.answer, difficulty)
    return {
            id: e.word_id, phrase: e.phrase, word: e.word, word_pos: e.word_pos, options: schema.options, option_schema_id: schema.schemaId
    }
  })

  // 2 FOR ACENTUAL GAME
  console.log("Creando sesi[on")
  const session = await createSession(difficulty, 2, db)
  if (!session.success || !session.payload.session_id) {
    return {
      success: false,
      message: session.payload.message,
      payload: null
    }
  }

  console.log("anadiendo acentuales a xsesion")
  const game = await addAcentualesToSession(session.payload.session_id, acentualQuestions, db)
  
  if (!game.content) {
    return {
      success: false,
      message: game.message,
      payload: null
    }
  }

  return {
    success: true,
    message: "Game created successfully",
    payload: {
        session_id: session.payload.session_id,
        questions: acentualQuestions
    }
  }
  

}
