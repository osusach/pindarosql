import { Client } from "@libsql/client/web";
import { dbQuery } from "../../shared/dbQuery";
export async function userExists(email: string, db: Client) {

  const query = `SELECT name FROM User WHERE email = "${email}"`
  const user = await dbQuery(query, db)

  if (!user.success || user.data.length == 0) {
    return {
      success: true,
      message: "Checked user existance successfully",
      payload: {
        response: false
      }
    }
  }

  return {
    success: true,
    message: "Checked user existance successfully",
    payload: {
        response: true
    }
  }
}