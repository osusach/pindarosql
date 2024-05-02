import { Client } from "@libsql/client/web";
import { rimaSet, rimaResponse, rimaSetResponse } from "./types";
import { Optional } from "../../shared/types";
import { dbQuery } from "../../shared/dbQuery";



export async function getRimas(amount: number, db: Client): Promise<Optional<rimaSet[]>> {
  // const minimumCorrectAnswers = Math.floor(Math.random() * amount / 3);

  const rimasQuery = `SELECT id, word, category, rhyme, vowels FROM Rima WHERE Rima.is_active = 1 ORDER BY vowels;`
  const rimas = await dbQuery<rimaResponse>(rimasQuery, db)

  if (!rimas.success) {
    return {
      content: null,
      message: "Error while retrieving rimas"
    }
  }
  const rimaSets = selectRimas(rimas.data, amount)

  return rimaSets;
}

// TODO: FIND A WAY TO MAKE SURE THERE ARE AT LEAST X RHYMES
function selectRimas(rimas: rimaResponse[], totalRhymes: number): Optional<rimaSet[]> {
  const random = Math.floor((Math.random() * totalRhymes * 2 / 5) + (totalRhymes * 3 / 5));

  if (rimas.length < totalRhymes * 2) {
    return {
      content: null,
      message: "Not enough rhymes in database",
    }
  }

  let groupedRhymes:rimaResponse[][] = groupRhymes(rimas);
  let selectedRhymes: rimaSet[] = []
  while (selectedRhymes.length < random) {
    const randomPos = Math.floor(Math.random() * (groupedRhymes.length - 1));
    const selectedGroup = shuffle(groupedRhymes[randomPos])
    if (selectedGroup.length < 2) continue;
    const set = {rhyme_a: selectedGroup[0], rhyme_b: selectedGroup[1]};
    selectedRhymes.push(set);
  }
  selectedRhymes = addMissingRhymes(selectedRhymes, rimas, totalRhymes)
  
  return {
    message: "Rhymes retrieved successfully",
    content: shuffle(selectedRhymes)
  }
}

function addMissingRhymes(rimaSets: rimaSet[], rimas: rimaResponse[], totalRhymes: number) {
  while (rimaSets.length < totalRhymes) {
    const posA = Math.floor(Math.random() * rimas.length);
    const posB = Math.floor(Math.random() * rimas.length);
    while (posB === posA) {
      const posB = Math.floor(Math.random() * rimas.length);
    }
    const newSet:rimaSet = {
      rhyme_a: rimas[posA],
      rhyme_b: rimas[posB]
    }
    rimaSets.push(newSet)
  }
  return rimaSets
}


function groupRhymes(rimas: rimaResponse[]): rimaResponse[][] {
  let groupedRhymes: rimaResponse[][] = [];
  let prevVowels:string = "-1";
  let pos = -1;
  for (let rima of rimas) {
    if (rima.vowels != prevVowels) {
      groupedRhymes.push([]);
      prevVowels = rima.vowels;
      pos++;
    }
    groupedRhymes[pos].push(rima);
  }
  return groupedRhymes;
}

function shuffle<T>(array: T[]):T[] {
  let currentIndex = array.length,  randomIndex;
  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
  return array;
}