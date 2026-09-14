import { Client } from "@libsql/client/web";

import { loginSchema } from "../../shared/schemas"
import { user } from "../../shared/types";
import { decryptPassword } from "../../shared/decryptPassword";
import jwt from '@tsndr/cloudflare-worker-jwt'

export async function login(body: any, env: Bindings, db: Client) {

  const bodyValidation = loginSchema.safeParse(body)

  if (!bodyValidation.success) {
    return {
      success: false,
      message: bodyValidation.error,
      payload: {
        user: null
      }
    }
  }
  const data = bodyValidation.data

  let found: user | null = null
  try {
    const userQuery = await db.execute({
      sql: `SELECT id, name, course, email, password, is_admin FROM User WHERE email = ?;`,
      args: [data.email]
    })
    if (userQuery.rows.length > 0) {
      found = userQuery.rows[0] as unknown as user
    }
  } catch (e) {
    console.log("login db error", e)
  }

  if (!found) {
    return {
      success: false,
      message: "User credentials do not exist in database",
      payload: {
        user: null
      }
    }
  }

  let decryptedPassword = ""
  try {
    decryptedPassword = decryptPassword(found.password, env)
  } catch (e) {
    decryptedPassword = ""
  }

  if (data.password != decryptedPassword) {
    return {
      success: false,
      message: "User credentials do not exist in database",
      payload: {
        user: null
      }
    }
  }

  const token = await jwt.sign({user_id: found.id, is_admin: found.is_admin}, env.JWT_KEY)


  const response = {
    name: found.name,
    course: found.course,
    token: token
  }
  
  return {
    success: true,
    message: "Successfully logged in!",
    payload: {
        user: response
        
    }
  }
}
