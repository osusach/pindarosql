import { Client } from "@libsql/client/web";

type failedDbResponse = {
  success: false,
  error: unknown
}


type successfullDbResponse<T> = {
  success: true,
  data: T
}

type dbResponse<T> = successfullDbResponse<T> | failedDbResponse



export async function dbQuery<T>(query: string, db: Client): Promise<dbResponse<T[]>> {
  const dbRequest = db.execute(query)
  try {
    const dbResponse = await dbRequest
    return {
      success: true,
      data: dbResponse.rows as T[]
    }
  } catch (e) {
    return {
      success: false,
      error: e
    }
  }
}