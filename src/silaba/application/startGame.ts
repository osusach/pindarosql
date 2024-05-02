import { Client } from "@libsql/client/web";

import { createSession } from "../../shared/createSession"
import { silaba, silabaQuestion } from "../../shared/types"
import { addSilabasToSession } from "./addSilabasToSession"
import { getSilabas } from "./getSilabas"
import { selectSchema } from "./optionSchemas"

export async function startGame(difficulty: number, db: Client) {
  let rows = await getSilabas(difficulty, 10, db)
  if (!rows.content) {
    return {
      success: false,
      message: rows.message,
      payload: null
    }
  }

  const silabas = rows.content
  const silabaQuestions: silabaQuestion[] = silabas.map(e => {
    const schema = selectSchema(e.answer)
    return {
    id: e.id, options: schema.options, option_schema_id: schema.schemaId, word: e.word
    }
  })

  const session = await createSession(difficulty, 1, db)
  if (!session.success || !session.payload.session_id) {
    return {
      success: false,
      message: session.payload.message,
      payload: null
    }
  }

  const game = await addSilabasToSession(session.payload.session_id, silabaQuestions, db)
  
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
      questions: silabaQuestions
    }
  }
  

}
