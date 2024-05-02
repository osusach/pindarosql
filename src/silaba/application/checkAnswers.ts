import { Client } from "@libsql/client/web";
import { GameCorrections, Optional, sessionAnswers, silabaCorrection, silabaQuestionResponse, userSubmit } from "../../shared/types";
import { options } from "./optionSchemas";
import { uploadAnswers } from "./uploadAnswers";

const scores = [ 100, 125, 150, 200 ]
const answerStrings = [ "Sin respuesta", "Una sílaba", "Dos sílabas", "Tres sílabas", "Cuatro sílabas", "Cinco sílabas", "Seis sílabas", "Siete sílabas", "Ocho sílabas"]

export async function checkAnswers(answers: userSubmit, questions:sessionAnswers, env: Bindings, db: Client): Promise<Optional<GameCorrections<silabaCorrection>>> {
  const session_difficulty = questions.session_difficulty;
  if (answers.answers.length != questions.answers.length) {
    return {
      content: null,
      message: "Invalid answers for the question"
    }
  }

  let score = 0
  let correct = 0
  let corrections: silabaCorrection[] = []

  for(let i = 0; i < questions.answers.length; i++) {
    const answer = answers.answers.find(e => {return e.question_id === questions.answers[i].silaba_id})
    if (!answer) {
      return {
        content: null,
        message: "Invalid answers sent!",
      }
    }
    const is_correct = (questions.answers[i].silaba_answer === answer.answer) ? true : false
    if (is_correct) {
      score += scores[questions.session_difficulty]
      correct ++

    }
    corrections.push({
      game_id: questions.answers[i].game_id,
      silaba_id: questions.answers[i].silaba_id,
      word: questions.answers[i].word,
      answer: questions.answers[i].silaba_answer,
      user_answer_value: answer.answer,
      user_answer: answerStrings[answer.answer],
      options: options[questions.answers[i].option_schema_id],
      is_correct: is_correct
    })
  }

  const uploadAnswersQuery = await uploadAnswers(corrections, answers.session_id, answers.token, score, questions.creation_date, session_difficulty, env, db)
  if (!uploadAnswersQuery.content) {
    return {
      message: "Answers were not stored successfully",
      content: null
    }
  }

  const response = {
    corrections: corrections,
    score: score,
    correct: correct,
    total: questions.answers.length,
    time: uploadAnswersQuery.content!
  }

  return {
    content: response,
    message: "All questions checked successfully"
  }


}
