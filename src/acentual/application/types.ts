import { answerOption } from "../../shared/types";

export type acentualResponse = {
  acentual_id: number,
  acentual_phrase: string,
  is_active: boolean
}


export type acentualGameResponse = {
  game_id: number,
  word_id: number,
  option_schema_id: number
}

export type acentualWordResponse = {
  word_id: number,
  acentual_id: number,
  word: string,
  acentual_answer: number,
  word_pos: number
}

export type acentualGameWithWord = {
  game_id: number,
  option_schema_id: number
  word_id: number,
  word: string,
  acentual_id: number,
  acentual_answer: number,
  word_pos: number
}

export type SessionAnswers = {
  answers: completeAcentualGame[],
  difficulty: number,
  creation_date: Date
}


export type acentualQuestionResponse = {
  session_difficulty: number
  creation_date: Date
  game_id: number
  option_schema_id: number
  word: string
  word_id: number
  acentual_phrase: string
  acentual_answer: number
  word_pos: number
}

export type acentual = {
  acentual_id: number,
  phrase: string,
  word_id: number,
  word: string,
  word_pos: number,
  answer: number
}

export type acentualQuestion = {
  id: number,
  phrase: string,
  word: string,
  word_pos: number,
  options: answerOption[],
  option_schema_id: number
}

export type acentualCorrection = {
  game_id: number,
  word_id: number,
  word: string,
  phrase: string,
  answer_value: number,
  answer: string,
  user_answer_value: number,
  user_answer: string,
  options: answerOption[],
  is_correct: boolean
}

export type acentualGames = {
  success: boolean,
  payload: {
    message: string,
    acentualGames: acentualGameResponse[] | null
  }
}

export type acentualGamesWithWords= {
  success: boolean,
  payload: {
    message: string,
    acentualGames: acentualGameWithWord[] | null
  }
}


export type acentualSessionAnswers = {
  success: boolean,
  payload: {
    message: string,
    answers: completeAcentualGame[] | null,
    difficulty: number | null,
    creation_date: Date | null
  }
}

export type completeAcentualGame = {
  game_id: number,
  option_schema_id: number
  word_id: number,
  word: string,
  acentual_id: number,
  acentual_phrase: string,
  acentual_answer: number,
  word_pos: number
}

export type completeAcentualGames = {
  success: boolean,
  payload: {
    message: string,
    acentualGames: completeAcentualGame[] | null
  }
}

export type acentualPreGame = {
  acentual_id: number
  acentual_phrase: string
  acentual_words: string
  acentual_word: string
  acentual_word_pos: number
  acentual_answer: number
}


export type corrections = {
  corrections: acentualCorrection[],
  score: number,
  correct: number,
  total: number,
  time: string
}