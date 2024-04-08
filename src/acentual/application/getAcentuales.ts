import type { Connection, ExecutedQuery } from "@planetscale/database";
import { acentual, acentualPreGame, acentualResponse, acentualWordResponse } from "./types";
import { Optional } from "../../shared/types";

export async function getAcentuales(difficulty: number, amount: number, db: Connection): Promise<Optional<acentual[]>> {
  console.log("Obteniendo acentuales")
  let acentualQuery: ExecutedQuery
  console.log("nashe")
  switch (difficulty) {
    case 0:
      acentualQuery = await db.execute(`SELECT AcentualWord.acentual_id, AcentualWord.id word_id, AcentualWord.word word, AcentualWord.word_pos word_pos, AcentualWord.answer acentual_answer FROM AcentualWord WHERE answer > 3  ORDER BY RAND() LIMIT ${amount};`)
      break
    case 1:
      acentualQuery = await db.execute(`SELECT AcentualWord.acentual_id, AcentualWord.id word_id, AcentualWord.word word, AcentualWord.word_pos word_pos, AcentualWord.answer acentual_answer FROM AcentualWord WHERE answer > 3 OR answer < 3 ORDER BY RAND() LIMIT ${amount};`)
      break
    default:
      acentualQuery = await db.execute(`SELECT AcentualWord.acentual_id, AcentualWord.id word_id, AcentualWord.word word, AcentualWord.word_pos word_pos, AcentualWord.answer acentual_answer FROM AcentualWord ORDER BY RAND() LIMIT ${amount};`)
      break
  }
  console.log("nashe")
  if (acentualQuery.size < amount) {
    return {
      content: null,
      message: "Not enough questions to ask!"
    }
  }

  const wordsWithPhrase = await getWordsWithPhrase(acentualQuery.rows as acentualWordResponse[], db)
  return wordsWithPhrase
}

async function getWordsWithPhrase(words: acentualWordResponse[], db: Connection): Promise<Optional<acentual[]>>{
  console.log("Obteniendo frases frases")
  const ids = words.map(e=> e.acentual_id).join(", ")
  const phrases = await db.execute(`SELECT Acentual.id acentual_id, Acentual.phrase acentual_phrase, Acentual.is_active is_active FROM Acentual WHERE id IN (${ids});`)
  if (phrases.size == 0) {
    return {
      message: "Error while retrieving phrases",
      content: null
    }
  }

  const fullWords = joinPhrases(words, phrases.rows as acentualResponse[])
  
  if (!fullWords) {
    return {
      message: "Error while joining phrases with words",
      content: null
    }
  }
  
  return {
    message: "Successfully retrieved words and phrases",
    content: fullWords
  }


}

function joinPhrases(words: acentualWordResponse[], phrases: acentualResponse[]): acentual[] | null {
  console.log("Uniendo frases")
  const acentuales: acentual[] = []
  console.log(phrases.map(e=>e.acentual_id).join(", "))
  for (let i = 0; i < words.length; i++) {
    console.log(i)
    const phrase = phrases.find(e => e.acentual_id == words[i].acentual_id);
    if (!phrase) {
      return null;
    }
    acentuales.push({
      phrase: phrase.acentual_phrase,
      acentual_id: phrase.acentual_id,
      word_id: words[i].word_id,
      word: words[i].word,
      word_pos: words[i].word_pos,
      answer: words[i].acentual_answer
    })
  }
  return acentuales
}