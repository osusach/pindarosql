import { answerOption } from "../../shared/types"
const easyOptions = [
  [
    {value: 4, answer: "Aguda"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"},
    {value: 7, answer: "Sobreesdrújula"}
  ]
]

const mediumOptions = [
  [
    {value: 4, answer: "Aguda"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"},
    {value: 7, answer: "Sobreesdrújula"}
  ],
  [
    {value: 4, answer: "Aguda"},
    {value: 1, answer: "Monosílabo átono"},
    {value: 2, answer: "Monosílabo tónico"},
    {value: 5, answer: "Grave"}
  ],
  [
    {value: 4, answer: "Aguda"},
    {value: 1, answer: "Monosílabo átono"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"}
  ],
  [
    {value: 4, answer: "Aguda"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"},
    {value: 2, answer: "Monosílabo tónico"}
  ],
]

const hardOptions = [
  [
    {value: 4, answer: "Aguda"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"},
    {value: 7, answer: "Sobreesdrújula"}
  ],
  [
    {value: 4, answer: "Aguda"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"},
    {value: 3, answer: "Bisílabo átono"}
  ],
  [
    {value: 4, answer: "Aguda"},
    {value: 1, answer: "Monosílabo átono"},
    {value: 2, answer: "Monosílabo tónico"},
    {value: 5, answer: "Grave"}
  ],
  [
    {value: 4, answer: "Aguda"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"},
    {value: 2, answer: "Monosílabo tónico"}
  ],
  [
    {value: 3, answer: "Bisílabo átono"},
    {value: 5, answer: "Grave"},
    {value: 6, answer: "Esdrújula"},
    {value: 2, answer: "Monosílabo tónico"}
  ]
]


export const allOptions = [
  easyOptions,
  mediumOptions,
  hardOptions
]

const mediumOptionsValues = [
  [
    4,
    5,
    6,
    7
  ],
  [
    4,
    1,
    2,
    5
  ],
  [
    4,
    1,
    5,
    6
  ],
  [
    4,
    5,
    6,
    2
  ]
]

const hardOptionsValues = [
  [
    4,
    5,
    6,
    7
  ],
  [
    4,
    5,
    6,
    3
  ],
  [
    4,
    1,
    2,
    5
  ],
  [
    4,
    5,
    6,
    2,
  ],
  [
    3,
    5,
    6,
    2,
  ]
]

const allOptionsValues = [
  [[4, 5, 6, 7]],
  mediumOptionsValues,
  hardOptionsValues
]

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}


export function selectSchema(correctAnswer: number, difficulty: number): {options: answerOption[], schemaId: number} {

  while (true) {
    const option = getRandomInt(allOptionsValues[difficulty].length - 1)
    if (allOptionsValues[difficulty][option].includes(correctAnswer)) {
      return {
        options: allOptions[difficulty][option],
        schemaId: option
      }
    }
  }

}