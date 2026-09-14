import { Client } from "@libsql/client/web";
import { silaba } from "../../shared/types";
import { validateAdmin } from "../../shared/validateAdmin";
import { loginWithTokenSchema } from "../../shared/schemas";
import { rimaResponse } from "./types";
import { dbQuery } from "../../shared/dbQuery";

export async function getAllRimas(body: any, env: Bindings, db: Client) {

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

  const rimasQuery = `SELECT id, word, category, rhyme, is_active FROM Rima ORDER BY id;`;
  const rimas = await dbQuery<rimaResponse>(rimasQuery, db)

  if (!rimas.success) {
    return {
      success: false,
      message: "Error while retrieving rimas",
      payload: null
    }
  }




  return {
    success: true,
    message: "Questions retreived successfully",
    payload: {
      rimas: rimas.data
    }
  };
}