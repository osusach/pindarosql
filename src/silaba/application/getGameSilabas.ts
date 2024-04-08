import { Connection } from "@planetscale/database";
import { Optional, fullSilabaAnswer, gameSilabasIds, silabaAnswer, silabaQuestionResponse } from "../../shared/types";

export async function getGamesSilabas(session_id: string, db: Connection): Promise<Optional<silabaQuestionResponse[]>> {
  const ids = await getGames(session_id, db);
  if (!ids.content) {
    return {
      content: null,
      message: ids.message
    }
  }

  const silabaIds = ids.content.map(e => e.silaba_id)
  const idString = silabaIds.join(", ")
  const silabas = await db.execute(`SELECT Silaba.id silaba_id, Silaba.word, Silaba.answer silaba_answer FROM Silaba WHERE Silaba.id IN (${idString});`)

  if (silabas.size === 0) {
    return {
      content: null,
      message: "Error while trying to retrieve silabas"
    }
  }

  const fullSilabas = joinSilabasInfo(ids.content, silabas.rows as silabaAnswer[])

  if (!fullSilabas) {
    return {
      content: null,
      message: "Error while trying to join silabas and their info"
    }
  }


  return {
    content: fullSilabas,
    message: "Silabas retrieved successfully"
  }
}


async function getGames(session_id: string, db: Connection): Promise<Optional<gameSilabasIds[]>> {
  const games = await db.execute(`SELECT id game_id, silaba_id, option_schema_id FROM SilabaGame WHERE session_id = "${session_id}";`)
  if (games.size === 0) {
    return {
      content: null,
      message: "There are no games with such session id"
    }
  }
  return {
    content: games.rows as gameSilabasIds[],
    message: "Silaba ids retrieved successfully"
  }

}

function joinSilabasInfo(games: gameSilabasIds[], silabas: silabaAnswer[]) {
  const result: silabaQuestionResponse[] = []
  for (let i = 0; i < games.length; i++) {
    const silaba = silabas.find(e => e.silaba_id == games[i].silaba_id)
    if (!silaba) {
      return null
    }
    const fullSilaba = {
      word: silaba.word,
      silaba_answer: silaba.silaba_answer,
      ... games[i]
    }
    result.push(fullSilaba)
  }
  return result
}