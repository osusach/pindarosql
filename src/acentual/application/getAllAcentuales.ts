import { Client } from "@libsql/client/web";
import { silaba } from "../../shared/types";
import { validateAdmin } from "../../shared/validateAdmin";
import { loginWithTokenSchema } from "../../shared/schemas";
import { acentualResponse } from "./types";
import { dbQuery } from "../../shared/dbQuery";

export async function getAllAcentuales(body: any, env: Bindings, db: Client) {

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

  const acentualQuery = `SELECT id acentual_id, phrase acentual_phrase, is_active FROM Acentual ORDER BY id;`;

  const acentuales = await dbQuery<acentualResponse>(acentualQuery, db)

  if (!acentuales.success) {
    return {
      success: false,
      message: "Error while retrieving acentuales",
      payload: null
    }
  }

  return {
    success: true,
    message: "Questions retreived successfully",
    payload: {
      silabas: acentuales.data
    }
  };
}