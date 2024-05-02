import { Client } from "@libsql/client/web"
import { user } from "../../shared/types"
import { dbQuery } from "../../shared/dbQuery"

type id = {
  id: number
}

export async function getUserId(email: string, password: string, db: Client) {
  const query = `SELECT id FROM User WHERE email = "${email}" AND password = "${password}";`
  const userId = await dbQuery<id>(query, db)
  const userQuery = await db.execute(`SELECT id FROM User WHERE email = "${email}" AND password = "${password}";`)

  if (!userId.success || userId.data.length == 0) {
    return {
      success: false,
      message: "User credentials do not exist in database",
      payload: {}
    }
  }
  return {
    success: true,
    message: "Successfully logged in!",
    payload: 
        userId.data[0]
  }
}