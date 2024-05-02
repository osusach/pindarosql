import { Client } from "@libsql/client/web";
import { acentualGames, acentualGameResponse } from "./types";
import { Optional } from "../../shared/types";
import { dbQuery } from "../../shared/dbQuery";




export async function getAcentualGames(session_id: string, db: Client): Promise<Optional<acentualGameResponse[]>>{


  const gameQuery = `SELECT AcentualGame.id game_id,
                                             AcentualGame.word_id,
                                             AcentualGame.option_schema_id
                                             FROM AcentualGame
                                             WHERE AcentualGame.session_id = "${session_id}";`

  const game =  await dbQuery<acentualGameResponse>(gameQuery, db)                                            

  if (!game.success || game.data.length == 0) {
    return {
      message: "No games found with such session id!",
      content: null,
    }
  }
  return {
    message: "Games retrieved successfully",
    content: game.data
  }
}