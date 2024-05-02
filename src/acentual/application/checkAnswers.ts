import { Client } from "@libsql/client/web";
import { GameCorrections, Optional, userSubmit } from "../../shared/types";
import { allOptions } from "./optionSchemas";
import { uploadAnswers } from "./uploadAnswers";
import { acentualSessionAnswers, acentualCorrection, corrections, SessionAnswers } from "./types";

const scores = [ 100, 125, 150, 200 ]
const answerStrings = [ "Sin respuesta", "Monosílabo átono", "Monosílabo tónico", "Bisílabo átono", "Aguda", "Grave", "Esdrújula", "Sobreesdrújula"]


export async function checkAnswers(answers: userSubmit, sessionAnswers:SessionAnswers, env: Bindings, db: Client): Promise<Optional<GameCorrections<acentualCorrection>>> {
  const questions = sessionAnswers.answers
  const session_difficulty = sessionAnswers.difficulty
  const creation_date = sessionAnswers.creation_date
  
  if (answers.answers.length != questions.length) {
    return {
      content: null,
      message: "Invalid answers for the question",
    }
  }

  let score = 0
  let correct = 0
  let corrections: acentualCorrection[] = []

  for(let i = 0; i < questions.length; i++) {
    const answer = answers.answers.find(e => {return e.question_id === questions[i].word_id})
    if (!answer) {
      return {
        content: null,
        message: "Invalid answers sent!",
      }
    }
    const is_correct = (questions[i].acentual_answer === answer.answer) ? true : false
    if (is_correct) {
      score += scores[session_difficulty]
      correct ++

    }
    corrections.push({
      game_id: questions[i].game_id,
      word_id: questions[i].word_id,
      word: questions[i].word,
      phrase: questions[i].acentual_phrase,
      answer_value: questions[i].acentual_answer,
      answer: answerStrings[questions[i].acentual_answer],
      user_answer_value: answer.answer,
      user_answer: answerStrings[answer.answer],
      options: allOptions[session_difficulty][questions[i].option_schema_id],
      is_correct: is_correct
    })
  }

  const uploadAnswersQuery = await uploadAnswers(corrections,
                                                 answers.session_id,
                                                 answers.token,
                                                 score,
                                                 creation_date,
                                                 session_difficulty,
                                                 env,
                                                 db)
  if (!uploadAnswersQuery.content) {
    return {
      content: null,
      message: "Answers were not stored successfully",
    }
  }

  const response = {
    corrections: corrections,
    score: score,
    correct: correct,
    total: questions.length,
    time: uploadAnswersQuery.content
  }
  return {
    content: response,
    message: "All questions checked successfully",
  }


}
