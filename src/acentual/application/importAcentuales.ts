import { Client } from "@libsql/client/web";
import { importAcentualSchema } from "../../shared/schemas";
import { validateAdmin } from "../../shared/validateAdmin";
import { parsePhrase, reconcileAcentualWords } from "./editAcentuales";

type parsedWord = { word: string, answer: number, pos: number }

type existingAcentual = {
  id: number,
  phrase: string,
  is_active: number
}

function wordsEqual(existing: parsedWord[], incoming: parsedWord[]) {
  if (existing.length !== incoming.length) return false
  const a = existing.slice().sort((x, y) => x.pos - y.pos)
  const b = incoming.slice().sort((x, y) => x.pos - y.pos)
  return a.every((word, i) => word.pos === b[i].pos && word.word === b[i].word && word.answer === b[i].answer)
}

export async function importAcentuales(body: any, env: Bindings, db: Client) {
  const bodyValidation = importAcentualSchema.safeParse(body);
  if (!bodyValidation.success) {
    return { success: false, message: bodyValidation.error.toString(), payload: null }
  }
  const data = bodyValidation.data

  if (!(await validateAdmin(data.token, env))) {
    return { success: false, message: "You have no authorization to do this!", payload: null }
  }

  const rows = data.acentuales
  const existing = await db.execute("SELECT id, phrase, is_active FROM Acentual;")
  const byId = new Map<number, existingAcentual>()
  const byPhrase = new Map<string, existingAcentual>()
  for (const raw of existing.rows) {
    const row: existingAcentual = {
      id: Number(raw.id),
      phrase: String(raw.phrase),
      is_active: Number(raw.is_active)
    }
    byId.set(row.id, row)
    byPhrase.set(row.phrase, row)
  }

  const existingWords = await db.execute("SELECT acentual_id, word, word_pos, answer FROM AcentualWord WHERE is_active = 1;")
  const wordsByAcentual = new Map<number, parsedWord[]>()
  for (const raw of existingWords.rows) {
    const acentualId = Number(raw.acentual_id)
    if (!wordsByAcentual.has(acentualId)) wordsByAcentual.set(acentualId, [])
    wordsByAcentual.get(acentualId)!.push({
      word: String(raw.word),
      answer: Number(raw.answer),
      pos: Number(raw.word_pos)
    })
  }

  const seenPhrases = new Set<string>()
  const usedIds = new Set<number>()
  const inserts: { words: parsedWord[], phrase: string, isActive?: boolean }[] = []
  const updates: { id: number, words: parsedWord[], phrase: string, isActive?: boolean, changes: boolean }[] = []
  const conflicts: { row: number, message: string }[] = []
  let idNotFound = 0

  rows.forEach((row, index) => {
    const line = index + 1
    const words = parsePhrase(row.phrase)
    if (!words || words.length === 0) {
      conflicts.push({ row: line, message: `formato de frase inválido, use palabra-respuesta-palabra-respuesta` })
      return
    }
    const phrase = words.map(word => word.word).join(" ")
    if (seenPhrases.has(phrase)) {
      conflicts.push({ row: line, message: `frase duplicada en el archivo: "${phrase}"` })
      return
    }
    seenPhrases.add(phrase)

    let target: existingAcentual | undefined
    if (row.id !== undefined) {
      target = byId.get(Number(row.id))
      if (!target) idNotFound++
    }
    if (!target) target = byPhrase.get(phrase)

    if (target) {
      if (usedIds.has(target.id)) {
        conflicts.push({ row: line, message: `el id ${target.id} es reclamado por más de una fila` })
        return
      }
      const owner = byPhrase.get(phrase)
      if (owner && owner.id !== target.id) {
        conflicts.push({ row: line, message: `la frase "${phrase}" ya pertenece al id ${owner.id}` })
        return
      }
      usedIds.add(target.id)
      const changes = !(
        target.phrase === phrase &&
        wordsEqual(wordsByAcentual.get(target.id) ?? [], words) &&
        (row.is_active === undefined || target.is_active === (row.is_active ? 1 : 0))
      )
      updates.push({ id: target.id, words, phrase, isActive: row.is_active, changes })
    } else {
      inserts.push({ words, phrase, isActive: row.is_active })
    }
  })

  const summary = {
    toInsert: inserts.length,
    toUpdate: updates.filter(u => u.changes).length,
    unchanged: updates.filter(u => !u.changes).length,
    idNotFound,
    conflicts
  }

  if (conflicts.length) {
    return { success: false, message: "No se importó nada: el archivo contiene conflictos", payload: summary }
  }
  if (data.preview) {
    return { success: true, message: "Vista previa generada", payload: summary }
  }

  const tx = await db.transaction("write")
  try {
    for (const insert of inserts) {
      const active = insert.isActive === undefined ? 1 : (insert.isActive ? 1 : 0)
      const result = await tx.execute({
        sql: `INSERT INTO Acentual (phrase, is_active) VALUES (?, ?);`,
        args: [insert.phrase, active]
      })
      const acentualId = Number(result.lastInsertRowid)
      for (const word of insert.words) {
        await tx.execute({
          sql: `INSERT INTO AcentualWord (word, word_pos, answer, acentual_id, is_active) VALUES (?, ?, ?, ?, 1);`,
          args: [word.word, word.pos, word.answer, acentualId]
        })
      }
    }
    for (const update of updates) {
      await tx.execute({
        sql: `UPDATE Acentual SET phrase = ?, is_active = COALESCE(?, is_active) WHERE id = ?;`,
        args: [update.phrase, update.isActive === undefined ? null : (update.isActive ? 1 : 0), update.id]
      })
      await reconcileAcentualWords(tx, update.id, update.words)
    }
    await tx.commit()
  } catch (e) {
    await tx.rollback()
    return { success: false, message: "Error al importar: no se aplicó ningún cambio", payload: null }
  }

  return { success: true, message: "Acentuales importados correctamente", payload: summary }
}
