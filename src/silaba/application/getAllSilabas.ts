import { Connection } from "@planetscale/database";
import { silaba } from "../../shared/types";
import { validateAdmin } from "../../shared/validateAdmin";
import { adminCredentialsSchema, loginWithTokenSchema } from "../../shared/schemas";

export async function getAllSilabas(body: any, env: Bindings, db: Connection) {

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

  const silabasQuery = await db.execute(`
    SELECT * FROM Silaba ORDER BY id;
  `);


  return {
    success: true,
    message: "Questions retreived successfully",
    payload: {
      silabas: silabasQuery.rows as silaba[]
    }
  };
}