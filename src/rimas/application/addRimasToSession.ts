
import { Client } from "@libsql/client/web";
import { bloqueRima, identificadorRima } from "../../rimas/application/rimas";
import { rimaSet, rimaSetWithGame } from "./types";
import { Optional } from "../../shared/types";


export async function addRimasToSession(sessionId: string,
                                             questions: rimaSet[],
                                             option_schema_id: number,
                                             db: Client): Promise<Optional<rimaSetWithGame[]>> {

  return {
    message: "Session games linked successfully!",
    content: await getGameIds(sessionId, questions, option_schema_id, db)
  };
}


async function getGameIds(sessionId: string, questions: rimaSet[], option_schema_id: number, db: Client){
  const unawaitedQueries = []
  for (let i = 0; i < questions.length; i++) {
    const e = questions[i]
    const word_a = new bloqueRima(e.rhyme_a.word, e.rhyme_a.category, e.rhyme_a.rhyme)
    const word_b = new bloqueRima(e.rhyme_b.word, e.rhyme_b.category, e.rhyme_b.rhyme)
    const answer = identificadorRima(word_a, word_b)
    const queryValues = `("${sessionId}", ${e.rhyme_a.id}, ${e.rhyme_b.id}, ${answer}, ${option_schema_id})`
    const query = `INSERT INTO RimaGame
                  (session_id, word_a_id, word_b_id, answer, option_schema_id)
                  VALUES ${queryValues};`
    
    unawaitedQueries.push(db.execute(query))
  }
  
  // HORRIBLE 
  const rimaGames:rimaSetWithGame[] = []
  for (let i = 0; i < unawaitedQueries.length; i++) {
    const game_id = (await unawaitedQueries[i]).lastInsertRowid
    rimaGames.push({
      rhyme_a: questions[i].rhyme_a,
      rhyme_b: questions[i].rhyme_b,
      game_id: parseInt(game_id!.toString())})
  }


  return rimaGames



}