import type { Connection } from "@planetscale/database";

import { acentualQuestion } from "./types"
import { Optional } from "../../shared/types";

export async function addAcentualesToSession(sessionId: string, questions: acentualQuestion[], db: Connection): Promise<Optional<Boolean>> {

  console.log("Añadiendoooo")
  const queri = `
  INSERT INTO AcentualGame (session_id, word_id, option_schema_id)
  VALUES ${questions.map(e => `("${sessionId}", ${e.id}, ${e.option_schema_id})`).join(",")};
`
  console.log(queri)
  const uploadQuery = await db.execute(queri);
  console.log("Añadido")

  if (uploadQuery.rowsAffected != questions.length) {
    return {
      content: false,
      message: "Session games linked unsuccessfully!"

    }
  }
  return {
    content: true,
    message: "Session games linked successfully!"

    
  };
}
