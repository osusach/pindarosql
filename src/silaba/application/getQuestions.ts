import { Client } from "@libsql/client/web"
import { Optional, silabaQuestionResponse } from "../../shared/types"
import { getGamesSilabas } from "./getGameSilabas"

export async function getQuestions(session_id: string, db: Client): Promise<Optional<silabaQuestionResponse[]>> {
  const questionsQuery = await getGamesSilabas(session_id, db)

  return questionsQuery
}

