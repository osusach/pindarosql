import { Connection } from "@planetscale/database";
import { silaba } from "../../shared/types";
import { validateAdmin } from "../../shared/validateAdmin";
import { adminCredentialsSchema, deleteByIdSchema } from "../../shared/schemas";

export async function deleteAcentuales(body: any, env: Bindings, db: Connection) {
  const bodyValidation = deleteByIdSchema.safeParse(body);

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



  const idsString = data.ids.join(", ")
  await db.execute(`UPDATE Acentual SET Acentual.is_active = 0 WHERE Acentual.id IN (${idsString});`)
  await db.execute(`UPDATE AcentualWord SET AcentualWord.is_active = 0 WHERE AcentualWord.acentual_id IN (${idsString});`)

  return {
    success: true,
    message: "Given acentuales deleted successfully",
    payload: null
  };
}