import { Client } from "@libsql/client/web";
import { uploadSilabasSchema } from "../../shared/schemas"
import { validateAdmin } from "../../shared/validateAdmin"

export async function addSilaba(body: any, env: Bindings, db: Client) {
  const bodyValidation = uploadSilabasSchema.safeParse(body);

  if (!bodyValidation.success) {
    return {
      success: false,
      message: bodyValidation.error,
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

  const uploadQuery = await db.execute(`
    INSERT INTO Silaba (word, answer, difficulty)
    VALUES ${data.silabas.map(e => `("${e.word}", ${e.answer_value}, ${e.difficulty})`).join(",")};
  `);
  return {
    success: true,
    message: "Words uploaded successfully!",
    payload: null
  };
}

