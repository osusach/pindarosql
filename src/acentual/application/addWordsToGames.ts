import { Connection } from "@planetscale/database";

import { acentualGamesWithWords} from "./types"
import { getAcentualGames } from "./getGames";
import { acentualGames, acentualGameResponse, acentualWordResponse, acentualGameWithWord } from "./types";
import { Optional } from "../../shared/types";




export async function getAcentualGamesWithWords(session_id: string, db: Connection): Promise<Optional<acentualGameWithWord[]>> {
  const acentualGamesRequest = await getAcentualGames(session_id, db);
  if (!acentualGamesRequest.content) {
    return {
      message: acentualGamesRequest.message,
      content: null,
    }
  }

  const games = acentualGamesRequest.content
  const wordIds = games.map(game => {return game.word_id})
  const query = `SELECT AcentualWord.id word_id,
                        AcentualWord.acentual_id acentual_id,
                        AcentualWord.word word,
                        AcentualWord.answer acentual_answer,
                        AcentualWord.word_pos word_pos
                        FROM AcentualWord WHERE AcentualWord.id = ${wordIds.join(" OR AcentualWord.id = ")};`
  
  const wordsQuery = await db.execute(query)

  if (wordsQuery.size == 0) {
    return {
      message: "No words found for given games!",
      content: null
    }
  }

  const words = wordsQuery.rows as acentualWordResponse[]
  return addWordsToGames(games, words)
  
}

function addWordsToGames(games: acentualGameResponse[], words: acentualWordResponse[]): Optional<acentualGameWithWord[]> {
  const gamesWithWords:acentualGameWithWord[] = []

  for (const game of games) {
    const word = words.find(word => {return game.word_id == word.word_id})
    if (!word) {
      return {
        message: "Error while trying to find the word of one of the games",
        content: null
      }
    }
    
    gamesWithWords.push({
      ...game,
      ...word
    })
  }
  return {
    message: "Games retrieved successfully",
    content: gamesWithWords,
  }

}