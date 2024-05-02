import { Client } from "@libsql/client/web";
import { completeRimaGame, completeRimaGames, rimaResponse } from "./types";
import { getRimaGames } from './getGames'
import { Optional } from "../../shared/types";
import { dbQuery } from "../../shared/dbQuery";



export async function getCompleteRimaGames(session_id: string, db: Client): Promise<Optional<completeRimaGame[]>> {
  const gamesWithWordsRequest = await getRimaGames(session_id, db)
  if (!gamesWithWordsRequest.content) {
    return {
      message: gamesWithWordsRequest.message,
      content: null
    }
  }
  const games = gamesWithWordsRequest.content
  const acentualIds = games.map(e => {
    const bothIds = `Rima.id = ${e.word_a_id} 
                     OR Rima.id = ${e.word_b_id}`
    return bothIds
    })

  const rimasQuery = `SELECT Rima.id id,
                        Rima.word word,
                        Rima.category,
                        Rima.rhyme rhyme
                        FROM Rima WHERE ${acentualIds.join(" OR ")};`

  const rimas = await dbQuery<rimaResponse>(rimasQuery, db)
  if (!rimas.success || rimas.data.length == 0) {
    return {
      message: "No words found from given games!",
      content: null
    }
  }
  const completeAcentualGames:completeRimaGame[] = []

  for (const game of games) {
    const word_a = rimas.data.find(e => {return game.word_a_id == e.id})
    const word_b = rimas.data.find(e => {return game.word_b_id == e.id})
    if (!word_a || !word_b) {
      return {
        message: "Error while trying to find the word of one of the games",
        content: null
      }
    }
    
    completeAcentualGames.push({
      ...game,
      word_a_id: word_a.id,
      word_a: word_a.word,
      word_b_id: word_b.id,
      word_b:word_b.word
    })
  }
  return {
    message: "Games retrieved successfully",
    content: completeAcentualGames,
  }
}