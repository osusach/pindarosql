import type { Connection } from "@planetscale/database";
import { z } from "zod";
import { uploadRimaSchema } from "../../shared/schemas"
import { validateAdmin } from "../../shared/validateAdmin"

export async function addRimas(body: any, env: Bindings, db: Connection) {
  const bodyValidation = uploadRimaSchema.safeParse(body);

  if (!bodyValidation.success) {
    return {
      success: false,
      message: bodyValidation.error.toString(),
      payload: null
    };
  }

  const data = bodyValidation.data

  if (!(await validateAdmin(data.token, env))) {
    return {
      success: false,
      message: "You have no authorization to do this!",
      payload: null
    }
  }
  console.log("Validado")
  const rhymesValues = data.rimas.map(e=>{
    const vowelsArray = Array.from(e.rhyme).filter(char => /[aeiouAEIOU]/.test(char));
    const vowels = vowelsArray.join('');
    return `("${e.word}", "${e.category}", "${e.rhyme}", "${vowels}")`
  })
  const rhymesString = rhymesValues.join(",")
  const query = `INSERT INTO Rima (word, category, rhyme, vowels) VALUES ${rhymesString};`
  console.log(query);
  const uploadRhymeRequest = await db.execute(query)
  console.log('Executed query')
  if (uploadRhymeRequest.rowsAffected != data.rimas.length) {
    return {
      success: false,
      message: "Error while trying to upload the rhymes to the database",
      payload: null
    }
  }

  return {
    success: true,
    message: "Rhymes uploaded to database successfully!",
    payload: null
  }
}

