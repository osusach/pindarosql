import { Client } from "@libsql/client/web";
import { importRimasSchema } from "../../shared/schemas";
import { validateAdmin } from "../../shared/validateAdmin";

function getVowels(rhyme: string) {
  return Array.from(rhyme).filter(char => /[aeiouAEIOU]/.test(char)).join("")
}

type existingRima = {
  id: number,
  word: string,
  category: string,
  rhyme: string,
  is_active: number
}

export async function importRimas(body: any, env: Bindings, db: Client) {
  const bodyValidation = importRimasSchema.safeParse(body);
  if (!bodyValidation.success) {
    return { success: false, message: bodyValidation.error.toString(), payload: null }
  }
  const data = bodyValidation.data

  if (!(await validateAdmin(data.token, env))) {
    return { success: false, message: "You have no authorization to do this!", payload: null }
  }

  const rows = data.rimas
  const existing = await db.execute("SELECT id, word, category, rhyme, is_active FROM Rima;")
  const byId = new Map<number, existingRima>()
  const byWord = new Map<string, existingRima>()
  for (const raw of existing.rows) {
    const row: existingRima = {
      id: Number(raw.id),
      word: String(raw.word),
      category: String(raw.category),
      rhyme: String(raw.rhyme),
      is_active: Number(raw.is_active)
    }
    byId.set(row.id, row)
    byWord.set(row.word, row)
  }

  const seenWords = new Set<string>()
  const usedIds = new Set<number>()
  const inserts: typeof rows = []
  const updates: { id: number, row: typeof rows[number], changes: boolean }[] = []
  const conflicts: { row: number, message: string }[] = []
  let idNotFound = 0

  rows.forEach((row, index) => {
    const line = index + 1
    if (seenWords.has(row.word)) {
      conflicts.push({ row: line, message: `palabra duplicada en el archivo: "${row.word}"` })
      return
    }
    seenWords.add(row.word)

    let target: existingRima | undefined
    if (row.id !== undefined) {
      target = byId.get(Number(row.id))
      if (!target) idNotFound++
    }
    if (!target) target = byWord.get(row.word)

    if (target) {
      if (usedIds.has(target.id)) {
        conflicts.push({ row: line, message: `el id ${target.id} es reclamado por más de una fila` })
        return
      }
      const owner = byWord.get(row.word)
      if (owner && owner.id !== target.id) {
        conflicts.push({ row: line, message: `la palabra "${row.word}" ya pertenece al id ${owner.id}` })
        return
      }
      usedIds.add(target.id)
      const changes = !(
        target.word === row.word &&
        target.category === row.category &&
        target.rhyme === row.rhyme &&
        (row.is_active === undefined || target.is_active === (row.is_active ? 1 : 0))
      )
      updates.push({ id: target.id, row, changes })
    } else {
      inserts.push(row)
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

  const statements: { sql: string, args: any[] }[] = []
  for (const row of inserts) {
    statements.push({
      sql: "INSERT INTO Rima (word, category, rhyme, vowels, is_active) VALUES (?, ?, ?, ?, ?);",
      args: [
        row.word,
        row.category,
        row.rhyme,
        getVowels(row.rhyme),
        row.is_active === undefined ? 1 : (row.is_active ? 1 : 0)
      ]
    })
  }
  for (const update of updates) {
    statements.push({
      sql: "UPDATE Rima SET word = ?, category = ?, rhyme = ?, vowels = ?, is_active = COALESCE(?, is_active) WHERE id = ?;",
      args: [
        update.row.word,
        update.row.category,
        update.row.rhyme,
        getVowels(update.row.rhyme),
        update.row.is_active === undefined ? null : (update.row.is_active ? 1 : 0),
        update.id
      ]
    })
  }
  if (statements.length) await db.batch(statements, "write")

  return { success: true, message: "Rimas importadas correctamente", payload: summary }
}
