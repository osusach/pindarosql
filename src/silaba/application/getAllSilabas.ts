import { Client } from "@libsql/client/web";
import { silaba } from "../../shared/types";
import { validateAdmin } from "../../shared/validateAdmin";
import { adminCredentialsSchema, loginWithTokenSchema } from "../../shared/schemas";
import { dbQuery } from "../../shared/dbQuery";

export async function getAllSilabas(body: any, env: Bindings, db: Client) {

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

  const silabasQuery = `SELECT * FROM Silaba ORDER BY id;`
  const silabas = await dbQuery<silaba>(silabasQuery, db)

  if (!silabas.success) {
    return {
      success: false,
      message: "Error while retrieving silabas",
      payload: null
    }
  }

  return {
    success: true,
    message: "Questions retreived successfully",
    payload: {
      silabas: silabas.data
    }
  };
}