import { Client } from "@libsql/client/web";
import { validateAdmin } from "../../shared/validateAdmin";
import { editSilabaSchema } from "../../shared/schemas";

export async function editSilaba(body: any, env: Bindings, db: Client) {
  const bodyValidation = editSilabaSchema.safeParse(body);

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

  const { id, word, answer_value, difficulty, fonemas, grafemas } = data.silaba
  const updateQuery = await db.execute({
    sql: `UPDATE Silaba SET word = ?, answer = ?, difficulty = ?, fonemas = ?, grafemas = ? WHERE id = ?;`,
    args: [word, Number(answer_value), Number(difficulty), Number(fonemas), Number(grafemas), id]
  })

  if (updateQuery.rowsAffected != 1) {
    return {
      success: false,
      message: "Error while trying to update the silaba",
      payload: null
    }
  }

  return {
    success: true,
    message: "Silaba updated successfully",
    payload: null
  };
}
