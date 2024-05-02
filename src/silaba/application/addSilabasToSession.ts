import { Client } from "@libsql/client/web";
import { z } from "zod";
import { uploadSilabasSchema } from "../../shared/schemas"
import { validateAdmin } from "../../shared/validateAdmin"
import { Optional, silaba, silabaQuestion } from "../../shared/types"
import { selectSchema } from "./optionSchemas"

export async function addSilabasToSession(sessionId: string, questions: silabaQuestion[], db: Client): Promise<Optional<boolean>> {

  const uploadQuery = await db.execute(`
    INSERT INTO SilabaGame (session_id, silaba_id, option_schema_id)
    VALUES ${questions.map(e => `("${sessionId}", ${e.id}, ${e.option_schema_id})`).join(",")};
  `);

  if (uploadQuery.rowsAffected != questions.length) {
    return {
      message: "Session games linked unsuccessfully!",
      content: false
    }
  }
  return {
    message: "Session games linked successfully!",
    content: true
    
  };
}
