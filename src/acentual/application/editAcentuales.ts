import { Client } from "@libsql/client/web";
import { validateAdmin } from "../../shared/validateAdmin";
import { editAcentualSchema } from "../../shared/schemas";

type parsedWord = { word: string, answer: number, pos: number }

function parsePhrase(phrase: string): parsedWord[] | null {
  const parts = phrase.split("-")
  if (parts.length === 0 || parts.length % 2 !== 0) return null
  const words: parsedWord[] = []
  for (let i = 0; i < parts.length; i += 2) {
    const word = parts[i].trim()
    const answer = parseInt(parts[i + 1])
    if (word === "" || isNaN(answer)) return null
    words.push({ word, answer, pos: i / 2 })
  }
  return words
}

export async function editAcentual(body: any, env: Bindings, db: Client) {
  const bodyValidation = editAcentualSchema.safeParse(body);

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

  const words = parsePhrase(data.phrase)
  if (!words || words.length === 0) {
    return {
      success: false,
      message: "Invalid phrase format, use word-answer-word-answer",
      payload: null
    }
  }

  const phrase = words.map(e => e.word).join(" ")

  const existingQuery = await db.execute({
    sql: `SELECT id, word_pos FROM AcentualWord WHERE acentual_id = ? ORDER BY word_pos;`,
    args: [data.acentual_id]
  })
  const existingByPos = new Map<number, number>()
  existingQuery.rows.forEach(row => {
    existingByPos.set(Number(row.word_pos), Number(row.id))
  })

  await db.execute({
    sql: `UPDATE Acentual SET phrase = ? WHERE id = ?;`,
    args: [phrase, data.acentual_id]
  })

  for (const word of words) {
    const existingId = existingByPos.get(word.pos)
    if (existingId !== undefined) {
      await db.execute({
        sql: `UPDATE AcentualWord SET word = ?, answer = ?, word_pos = ?, is_active = 1 WHERE id = ?;`,
        args: [word.word, word.answer, word.pos, existingId]
      })
      existingByPos.delete(word.pos)
    } else {
      await db.execute({
        sql: `INSERT INTO AcentualWord (word, word_pos, answer, acentual_id, is_active) VALUES (?, ?, ?, ?, 1);`,
        args: [word.word, word.pos, word.answer, data.acentual_id]
      })
    }
  }

  // Words that are no longer part of the phrase are deactivated, not deleted,
  // so past games and corrections that reference them stay valid.
  for (const leftoverId of existingByPos.values()) {
    await db.execute({
      sql: `UPDATE AcentualWord SET is_active = 0 WHERE id = ?;`,
      args: [leftoverId]
    })
  }

  return {
    success: true,
    message: "Acentual updated successfully",
    payload: null
  };
}
