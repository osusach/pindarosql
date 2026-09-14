import { Client } from "@libsql/client/web";
import { validateAdmin } from "../../shared/validateAdmin";
import { loginWithTokenSchema } from "../../shared/schemas";
import { acentualResponse } from "./types";
import { dbQuery } from "../../shared/dbQuery";

type acentualRow = {
  acentual_id: number,
  acentual_phrase: string,
  is_active: boolean,
  word_id: number | null,
  word: string | null,
  word_pos: number | null,
  answer: number | null
}

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

  const acentualQuery = `
    SELECT Acentual.id acentual_id, Acentual.phrase acentual_phrase, Acentual.is_active is_active,
           AcentualWord.id word_id, AcentualWord.word word, AcentualWord.word_pos word_pos, AcentualWord.answer answer
    FROM Acentual
    LEFT JOIN AcentualWord ON Acentual.id = AcentualWord.acentual_id
    ORDER BY Acentual.id, AcentualWord.word_pos;`;

  const acentuales = await dbQuery<acentualRow>(acentualQuery, db)

  if (!acentuales.success) {
    return {
      success: false,
      message: "Error while retrieving acentuales",
      payload: null
    }
  }

  const grouped: acentualResponse[] = []
  const byId = new Map<number, acentualResponse>()
  for (const row of acentuales.data) {
    let item = byId.get(row.acentual_id)
    if (!item) {
      item = {
        acentual_id: row.acentual_id,
        acentual_phrase: row.acentual_phrase,
        is_active: row.is_active,
        words: []
      }
      byId.set(row.acentual_id, item)
      grouped.push(item)
    }
    if (row.word_id !== null) {
      item.words.push({
        word_id: row.word_id,
        word: row.word ?? "",
        word_pos: row.word_pos ?? 0,
        answer: row.answer ?? 0
      })
    }
  }

  return {
    success: true,
    message: "Questions retreived successfully",
    payload: {
      acentuales: grouped
    }
  };
}
