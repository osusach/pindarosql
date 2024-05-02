import { Client } from "@libsql/client/web";

import { acentualQuestion } from "./types"
import { Optional } from "../../shared/types";

export async function addAcentualesToSession(sessionId: string, questions: acentualQuestion[], db: Client): Promise<Optional<Boolean>> {

  const query = `
  INSERT INTO AcentualGame (session_id, word_id, option_schema_id)
  VALUES ${questions.map(e => `("${sessionId}", ${e.id}, ${e.option_schema_id})`).join(",")};
`
  const uploadQuery = await db.execute(query);

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
