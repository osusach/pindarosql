import { Client } from "@libsql/client/web";
import { acentualResponse, acentualGameWithWord, completeAcentualGame, completeAcentualGames } from "./types";
import { getAcentualGamesWithWords } from "./addWordsToGames";
import { Optional } from "../../shared/types";
import { dbQuery } from "../../shared/dbQuery";



export async function getCompleteAcentualGames(session_id: string, db: Client): Promise<Optional<completeAcentualGame[]>> {
  const gamesWithWordsRequest = await getAcentualGamesWithWords(session_id, db)
  if (!gamesWithWordsRequest.content) {
    return {
      content: null,
      message: gamesWithWordsRequest.message,
    }
  }
  const games = gamesWithWordsRequest.content
  const acentualIds = games.map(e => {return e.acentual_id})
  const phraseQuery = `SELECT Acentual.id acentual_id,
                        Acentual.phrase acentual_phrase
                        FROM Acentual WHERE Acentual.id = ${acentualIds.join(" OR Acentual.id = ")};`
  const phrases = await dbQuery<acentualResponse>(phraseQuery, db)
  if (!phrases.success || phrases.data.length == 0) {
    return {
      content: null,
      message: "No words found from given games!",
    }
  }
  const completeAcentualGames:completeAcentualGame[] = []

  for (const game of games) {
    const phrase = phrases.data.find(e => {return game.acentual_id == e.acentual_id})
    if (!phrase) {
      return {
        message: "Error while trying to find the word of one of the games",
        content: null
      }
    }
    
    completeAcentualGames.push({
      ...game,
      ...phrase
    })
  }
  return {
    content: completeAcentualGames,
    message: "Games retrieved successfully",
  }
}