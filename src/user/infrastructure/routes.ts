import { Hono } from 'hono';
import { login } from '../application/login';
import { addUser } from '../application/addUser';
import { addAdmin } from '../application/addAdmin';
import { cors } from 'hono/cors';
import { encryptPassword } from '../../shared/encryptPassword';
import { decryptPassword } from '../../shared/decryptPassword';
import { authenticateJWT } from '../../shared/authenticateJWT';
import { sqlClient } from '../../shared/sqlClient';




const users = new Hono<{ Bindings: Bindings }>()
users.use("*", cors())
users.post("/login", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const res = await login(body, c.env, conn)
  if (!res.success) {
    return c.json(
      {
        success: false,
        message: res.message,
        payload: {
          user: res.payload.user
        }
      }, 400)
  }
  return c.json({
    success: true,
    message: res.message,
    payload:{
      user: res.payload.user
    }
  }, 200)
})

users.post("/register", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const res = await addUser(body, c.env, conn)
  if (!res.success) {
    return c.json(
      {
        success: false,
        message: res.message,
        payload: null
      }, 400)
  }
  return c.json({
    success: true,
    message: res.message,
    payload: res.payload
  }, 200)
})

users.post("/registerAdmin", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const res = await addAdmin(body, c.env, conn)
  if (!res.success) {
    return c.json({success: false, message: res.message, payload: null}, 400)
  }
  return c.json({
    success: true, 
    message: res.message,
    payload :res.payload
  }, 200)
})

users.post("/loginToken", async (c) => {
  const body = await c.req.json()
  const xd = await authenticateJWT(body["token"], c.env)
  
  return c.text(xd.content!.user_id.toString())

})



export default users