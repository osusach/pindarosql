import { Client } from "@libsql/client/web";
import { acentual, acentualPreGame, acentualResponse, acentualWordResponse } from "./types";
import { Optional } from "../../shared/types";
import { dbQuery } from "../../shared/dbQuery";

export async function getAcentuales(difficulty: number, amount: number, db: Client): Promise<Optional<acentual[]>> {
  let acentualQuery: string

  switch (difficulty) {
    case 0:
      acentualQuery = `SELECT AcentualWord.acentual_id, AcentualWord.id word_id, AcentualWord.word word, AcentualWord.word_pos word_pos, AcentualWord.answer acentual_answer FROM AcentualWord WHERE answer > 3  ORDER BY RANDOM() LIMIT ${amount};`
      break
    case 1:
      acentualQuery = `SELECT AcentualWord.acentual_id, AcentualWord.id word_id, AcentualWord.word word, AcentualWord.word_pos word_pos, AcentualWord.answer acentual_answer FROM AcentualWord WHERE answer > 3 OR answer < 3 ORDER BY RANDOM() LIMIT ${amount};`
      break
    default:
      acentualQuery = `SELECT AcentualWord.acentual_id, AcentualWord.id word_id, AcentualWord.word word, AcentualWord.word_pos word_pos, AcentualWord.answer acentual_answer FROM AcentualWord ORDER BY RANDOM() LIMIT ${amount};`
      break
  }

  const acentual = await dbQuery<acentualWordResponse>(acentualQuery, db)
  if (!acentual.success || acentual.data.length < amount) {
    return {
      content: null,
      message: "Not enough questions to ask!"
    }
  }

  const wordsWithPhrase = await getWordsWithPhrase(acentual.data, db)
  return wordsWithPhrase
}

async function getWordsWithPhrase(words: acentualWordResponse[], db: Client): Promise<Optional<acentual[]>>{
  const ids = words.map(e=> e.acentual_id).join(", ")
  const phraseQuery = `SELECT Acentual.id acentual_id, Acentual.phrase acentual_phrase, Acentual.is_active is_active FROM Acentual WHERE id IN (${ids});`
  const phrases = await dbQuery<acentualResponse>(phraseQuery, db)
  if (!phrases.success || phrases.data.length == 0) {
    return {
      message: "Error while retrieving phrases",
      content: null
    }
  }

  const fullWords = joinPhrases(words, phrases.data)
  
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
  const acentuales: acentual[] = []
  for (let i = 0; i < words.length; i++) {
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