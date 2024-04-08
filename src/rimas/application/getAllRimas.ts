import { Connection } from "@planetscale/database";
import { silaba } from "../../shared/types";
import { validateAdmin } from "../../shared/validateAdmin";
import { loginWithTokenSchema } from "../../shared/schemas";
import { rimaResponse } from "./types";

export async function getAllRimas(body: any, env: Bindings, db: Connection) {

  const bodyValidation = loginWithTokenSchema.safeParse(body);

  if (!bodyValidation.success) {
    return {
      success: false,
      message: bodyValidation.error.toString(),
      payload: null
    };
  }
  const data = bodyValidation.data

  if (!(await validateAdmin(data.token, env))) {
    return {
      success: false,
      message: "You have no authorization to do this!",
      payload: null
    }
  }

  const rimasQuery = await db.execute(`
    SELECT id, word, category, rhyme, is_active FROM Rima ORDER BY id;`);

  const rimas = rimasQuery.rows as rimaResponse[]


  return {
    success: true,
    message: "Questions retreived successfully",
    payload: {
      silabas: rimas
    }
  };
}