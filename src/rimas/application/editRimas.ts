import { Client } from "@libsql/client/web";
import { validateAdmin } from "../../shared/validateAdmin";
import { editRimaSchema } from "../../shared/schemas";

function getVowels(rhyme: string) {
  return Array.from(rhyme).filter(char => /[aeiouAEIOU]/.test(char)).join("")
}

export async function editRima(body: any, env: Bindings, db: Client) {
  const bodyValidation = editRimaSchema.safeParse(body);

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

  const { id, word, category, rhyme } = data.rima
  const updateQuery = await db.execute({
    sql: `UPDATE Rima SET word = ?, category = ?, rhyme = ?, vowels = ? WHERE id = ?;`,
    args: [word, category, rhyme, getVowels(rhyme), id]
  })

  if (updateQuery.rowsAffected != 1) {
    return {
      success: false,
      message: "Error while trying to update the rima",
      payload: null
    }
  }

  return {
    success: true,
    message: "Rima updated successfully",
    payload: null
  };
}
