export type silaba = {
  id: number,
  word: string,
  answer: number,
  difficulty: number,
  fonemas: number,
  grafemas: number,
  is_active: boolean,
  creation_date: Date,
  modification_date: Date
}

export type answerOption = {
  value: number,
  answer: string
}

export type silabaQuestion = {
  word: string
  id: number
  options: answerOption[]
  option_schema_id: number
}

export type user = {
  id: number,
  name: string,
  course: string,
  email: string,
  password: string,
  is_admin: boolean
}

export type userAnswers = {
  question_id: number,
  answer: number
}

export type silabaQuestionResponse = {
  game_id: number
  option_schema_id: number
  silaba_id: number
  word: string
  silaba_answer: number
}
export type silabaCorrection = {
  game_id: number,
  silaba_id: number,
  word: string,
  answer: number
  user_answer_value: number,
  user_answer: string,
  options: answerOption[],
  is_correct: boolean
}

export type userSubmit = {
  session_id: string
  token: string | null,
  answers: userAnswers[]
}

export type Optional<T> = {
  content: T | null,
  message: string
}

export type GameCorrections<T> = {
  corrections: T[],
  score: number,
  correct: number,
  total: number,
  time: string
}

export type sessionData = {
  session_difficulty: number,
  creation_date: Date
}

export type gameSilabasIds = {
  game_id: number,
  silaba_id: number,
  option_schema_id: number
}

export type silabaAnswer = {
  silaba_id: number,
  word: string,
  silaba_answer: number,
}

export type fullSilabaAnswer = {
  game_id: number,
  silaba_id: number,
  word: string,
  silaba_answer: number,
  option_schema_id: number
}

export type sessionAnswers = {
  answers: fullSilabaAnswer[],
  session_difficulty: number,
  creation_date: Date
}