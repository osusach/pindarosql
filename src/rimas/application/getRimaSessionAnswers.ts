
import { Client } from "@libsql/client/web";
import { SessionAnswers } from "./types"
import { getSession } from "../../shared/getSession";
import { getCompleteRimaGames } from "./getCompleteRimaGames";
import { Optional} from "../../shared/types";



export async function getRimaSessionAnswers(session_id: string, db: Client): Promise<Optional<SessionAnswers>> {
  const session = await getSession(session_id, db);
  if (!session.content) {
    return {
      message: session.message,
      content: null
    }
  }

  const games = await getCompleteRimaGames(session_id, db);
  
  if (!games.content) {
    return {
      message: games.message,
      content: null
    }
  }

  const payload = {
    answers: games.content,
    difficulty: session.content.session_difficulty,
    creation_date: session.content.creation_date
    
  }
  return {
    message: "Session's questions successfully retrieved",
    content: payload
  }
}
