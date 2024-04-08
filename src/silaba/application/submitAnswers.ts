import type { Connection } from "@planetscale/database";
import { sessionAnswers } from "../../shared/schemas"
import { getQuestions } from "./getQuestions";
import { checkAnswers } from "./checkAnswers";
import { getSession } from "../../shared/getSession";

export async function submitAnswers(body: any, env: Bindings, db: Connection) {
  const bodyValidation = sessionAnswers.safeParse(body);
  if (!bodyValidation.success) {
    return {
      success: false,
      message: bodyValidation.error.toString(),
      payload: null
    };
  }
  const data = bodyValidation.data
  const questions = await getQuestions(data.session_id, db)
  if (!questions.content) {
    return {
      success: false,
      message: questions.message,
      payload: null
    }
  }

  const session = await getSession(data.session_id, db)

  if (!session.content) {
    return {
      success: false,
      message: session.message,
      payload: null
    }
  }
  const sessionWithAnswers = {
    answers: questions.content,
    session_difficulty: session.content.session_difficulty,
    creation_date: session.content.creation_date
  }

  const check = await checkAnswers(data, sessionWithAnswers, env, db)

  if (!check.content) {
    return {
      success: false,
      message: check.message,
      payload: null
    };
  }
  return {
    success: true,
    message: check.message,
    payload: {
      ... check.content
    }
  };
}

