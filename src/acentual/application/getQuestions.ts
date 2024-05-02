import { Client } from "@libsql/client/web";
import { acentualSessionAnswers, acentualGameResponse, completeAcentualGame, SessionAnswers } from "./types"
import { getSession } from "../../shared/getSession"
import { getCompleteAcentualGames } from "./addPhraseToGames";
import { Optional } from "../../shared/types";



export async function getAcentualSessionAnswers(session_id: string, db: Client): Promise<Optional<SessionAnswers>> {
  const session = await getSession(session_id, db);
  
  if (!session.content) {
    return {
      message: session.message,
      content: null,
    }
  }

  const games = await getCompleteAcentualGames(session_id, db);
  
  if (!games.content) {
    return {
      message: games.message,
      content: null

    }
  }

  const response = {
    answers: games.content,
    difficulty: session.content.session_difficulty,
    creation_date: session.content.creation_date
  }
  return {
    content: response,
    message: "Session's questions successfully retrieved",
  }
}
