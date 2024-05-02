import { Client } from "@libsql/client/web";
import { addAdminSchema } from "../../shared/schemas"
import { userExists } from "./userExists";
import { encryptPassword } from "../../shared/encryptPassword";
import jwt from '@tsndr/cloudflare-worker-jwt'
export async function addAdmin(body: any, env: Bindings, db: Client) {
  const bodyValidation = addAdminSchema.safeParse(body)

  if (!bodyValidation.success) {
    return {
      success: false,
      message: bodyValidation.error,
      payload: null
    };
  }
  const data = bodyValidation.data
  if (data.secret_key != env.SECRET_KEY) {
    return {
        success: false,
        message: "Invalid authorization",
        payload: null
    }
  }

  if ((await userExists(data.email, db)).payload.response) {
    return {
      success: false,
      message: "User already exists in database!",
      payload: null
    }
  }
  const encryptedPassword = await encryptPassword(data.password, env);
  const userQuery = await db.execute(`INSERT INTO User (name, course, email, password, is_admin)
                                      VALUES ("${data.name}", "N/A", "${data.email}", "${encryptedPassword}", 1)`)

  if (userQuery.rowsAffected != 1) {
    return {
      success: false,
      message: "Error adding user to database",
      payload: null
    }
  }

  const token = await jwt.sign({user_id: userQuery.lastInsertRowid, is_admin: true}, env.JWT_KEY)


  return {
    success: true,
    message: "User added successfully!",
    payload: {
      token: token
    }
  }
}