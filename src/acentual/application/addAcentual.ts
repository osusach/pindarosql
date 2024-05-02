import { Client } from "@libsql/client/web";
import { z } from "zod";
import { uploadAcentualSchema } from "../../shared/schemas"
import { validateAdmin } from "../../shared/validateAdmin"

export async function addAcentual(body: any, env: Bindings, db: Client) {
  const bodyValidation = uploadAcentualSchema.safeParse(body);

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

  
  for (let i = 0; i < data.acentuales.length; i++) {
    const words = data.acentuales[i].phrase.split("-")
    let acentualWords:{word: string, answer: number, pos: number}[] = []
    for (let j = 0; j < words.length / 2; j++) {
      acentualWords.push({word: words[j*2], answer: parseInt(words[j*2 + 1]), pos: j})
    }
    const phrase = acentualWords.map(e => {return e.word}).join(" ")
    const uploadPhraseQuery = await db.execute(`INSERT INTO Acentual (phrase) VALUES ("${phrase}");`)
    if (uploadPhraseQuery.rowsAffected != 1) {
      return {
        success: false,
        message: "Error while trying to upload the words to the database",
        payload: null
      }
    }
    const uploadWordsQuery = await db.execute (`INSERT INTO AcentualWord (word, word_pos, answer, acentual_id)
                                                VALUES ${acentualWords.map(e => {return `("${e.word}", ${e.pos}, ${e.answer}, ${uploadPhraseQuery.lastInsertRowid})`})}`)

    if (uploadWordsQuery.rowsAffected !=  acentualWords.length) {
      return {
        success: false,
        message: "Error while trying to upload the words to the database",
        payload: null
      }
    }
    
  }

  return {
    success: true,
    message: "Phrases uploaded to database successfully!",
    payload: null
  }
}

