import { Client } from "@libsql/client/web";
import { userSubmit, Optional, GameCorrections } from "../../shared/types";
import { getAnswer, selectSchema } from "./optionSchemas";
import { uploadAnswers } from "./uploadAnswers";
import { SessionAnswers, rimaCorrection, rimaSessionAnswers } from "./types";

const scores = [ 100, 125, 150, 200 ]

type corrections = {
  corrections: rimaCorrection[],
  score: number,
  correct: number,
  total: number,
  time: string
}


export async function checkAnswers(answers: userSubmit,
                                   sessionAnswers:SessionAnswers,
                                   env: Bindings,
                                   db: Client): Promise<Optional<GameCorrections<rimaCorrection>>> {
  const questions = sessionAnswers.answers
  const session_difficulty = sessionAnswers.difficulty
  const creation_date = sessionAnswers.creation_date
  const answerStrings = selectSchema(session_difficulty).options
  if (answers.answers.length != questions.length) {
    return {
      message:"Invalid answers for the question",
      content: null
    }
  }

  let score = 0
  let correct = 0
  let corrections: rimaCorrection[] = []

  for(let i = 0; i < questions.length; i++) {
    const answer = answers.answers.find(e => {return e.question_id === questions[i].game_id})
    if (!answer) {
      return {
        message: "Invalid answers sent!",
        content: null
      } 
    }

    
    let correctAnswer = questions[i].rima_answer
    if (session_difficulty === 0) {
      correctAnswer = correctAnswer > 2 ? 2 : correctAnswer;
    }
    const is_correct = (correctAnswer === answer.answer) ? true : false
    if (is_correct) {
      score += scores[session_difficulty]
      correct ++

    }

    corrections.push({
      game_id: questions[i].game_id,
      word_a_id: questions[i].word_a_id,
      word_b_id: questions[i].word_b_id,
      word_a: questions[i].word_a,
      word_b: questions[i].word_b,
      answer_value: questions[i].rima_answer,
      answer: getAnswer(session_difficulty, questions[i].rima_answer),
      user_answer_value: answer.answer,
      user_answer: getAnswer(session_difficulty, answer.answer),
      options: answerStrings,
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
      message: uploadAnswersQuery.message,
      content: null
    }
  }

  const payload = {
    corrections: corrections,
    score: score,
    correct: correct,
    total: questions.length,
    time: uploadAnswersQuery.content!
  }

  return {
    message: "Invalid answers for the question",
    content: payload
  }


}
