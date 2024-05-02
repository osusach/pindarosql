import { Client } from "@libsql/client/web";
import { z } from "zod";
import { uploadSilabasSchema } from "../../shared/schemas"
import { validateAdmin } from "../../shared/validateAdmin"
import { Optional, silaba } from "../../shared/types";
import { dbQuery } from "../../shared/dbQuery";

export async function getSilabas(difficulty: number, amount: number, db: Client): Promise<Optional<silaba[]>> {

  const silabasQuery = `SELECT * FROM Silaba WHERE difficulty <= ${difficulty} AND Silaba.is_active = 1 ORDER BY RANDOM() LIMIT ${amount};`
  const silabas = await dbQuery<silaba>(silabasQuery, db)
  if (!silabas.success  || silabas.data.length < amount) {
    return {
      content: null,
      message: "Not enough questions to ask!"
    } 
  }

  return {
    message: "Questions retreived successfully",
    content: silabas.data
  };
}