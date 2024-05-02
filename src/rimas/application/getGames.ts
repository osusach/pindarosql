import { Client } from "@libsql/client/web";
import { rimaGames, rimaGame } from "./types";
import { Optional } from "../../shared/types";
import { dbQuery } from "../../shared/dbQuery";


export async function getRimaGames(session_id: string, db: Client): Promise<Optional<rimaGame[]>>{


  const gameQuery = `SELECT RimaGame.id game_id,
                      RimaGame.word_a_id,
                      RimaGame.word_b_id,
                      RimaGame.answer rima_answer,
                      RimaGame.option_schema_id
                      FROM RimaGame
                      WHERE RimaGame.session_id = "${session_id}";`

  const games = await dbQuery<rimaGame>(gameQuery, db)

  if (!games.success || games.data.length == 0) {
    return {
      content: null,
      message: "No games found with such session id!",
    }
  }
  return {
    message: "Games retrieved successfully",
    content: games.data
  }
}