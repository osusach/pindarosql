import { Client } from "@libsql/client/web";

import { loginSchema } from "../../shared/schemas"
import { user } from "../../shared/types";
import { decryptPassword } from "../../shared/decryptPassword";
import jwt from '@tsndr/cloudflare-worker-jwt'
import { dbQuery } from "../../shared/dbQuery";
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
  const userQuery = `SELECT id, name, course, email, password, is_admin FROM User WHERE email = "${data.email}";`

  const user = await dbQuery<user>(userQuery, db)
  if (!user.success) {
    return {
      success: false,
      message: "User credentials do not exist in database",
      payload: {
        user: null
      }
    }
  }
  const decryptedPassword = decryptPassword(user.data[0].password, env);
  if (data.password != decryptedPassword) {
    return {
      success: false,
      message: "User credentials do not exist in database",
      payload: {
        user: null
      }
    }
  }

  const token = await jwt.sign({user_id: user.data[0].id, is_admin: user.data[0].is_admin}, env.JWT_KEY)


  const response = {
    name: user.data[0].name,
    course: user.data[0].course,
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