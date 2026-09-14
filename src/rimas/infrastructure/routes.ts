import { Hono } from 'hono';
import { startGame } from '../application/startGame';
import { submitAnswers } from '../application/submitAnswers';
import { addRimas } from '../application/addRimas';
import { getAllRimas } from '../application/getAllRimas';
import { cors } from 'hono/cors';
import { deleteRimas } from '../application/deleteRimas';
import { activateRimas } from '../application/activateRimas';
import { editRima } from '../application/editRimas';
import { sqlClient } from '../../shared/sqlClient';


const rimas = new Hono<{ Bindings: Bindings }>()
rimas.use("*", cors())


rimas.get("/start/:difficulty", async (c) => {
  const conn = sqlClient(c.env)
  const diff = parseInt(c.req.param("difficulty"))
  const game = await startGame(diff, conn)
  if (!game.success) {
    return c.json({success: false, message: game.message, payload: null}, 400)
  }
  return c.json({success: true, message: game.message, payload: game.payload}, 200)
})

rimas.post("/submit", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const submit = await submitAnswers(body, c.env, conn)
  if (!submit.success) {
    return c.json({success: false, message: submit.message, payload: null}, 400)
  }
  return c.json({success: true, message: submit.message, payload: submit.payload}, 200)
  
})


rimas.post("/uploadRimas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const upload = await addRimas(body, c.env, conn)
  if (!upload.success) {
    return c.json({success: false, message: upload.message, payload: null}, 400)
  }
  return c.json({success: true, message: upload.message, payload: upload.payload}, 200)
})


rimas.post("/allRimas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const rimas = await getAllRimas(body, c.env, conn)
  if (!rimas.success) {
    return c.json({success: false, message: rimas.message, payload: null}, 400)
  }
  return c.json({success: true, message: rimas.message, payload: rimas.payload}, 200)
})

rimas.post("/deleteRimas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const rimas = await deleteRimas(body, c.env, conn)
  if (!rimas.success) {
    return c.json({success: false, message: rimas.message, payload: null}, 400)
  }
  return c.json({success: true, message: rimas.message, payload: rimas.payload}, 200)
})

rimas.post("/activateRimas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const rimas = await activateRimas(body, c.env, conn)
  if (!rimas.success) {
    return c.json({success: false, message: rimas.message, payload: null}, 400)
  }
  return c.json({success: true, message: rimas.message, payload: rimas.payload}, 200)
})

rimas.post("/editRima", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const rima = await editRima(body, c.env, conn)
  if (!rima.success) {
    return c.json({success: false, message: rima.message, payload: null}, 400)
  }
  return c.json({success: true, message: rima.message, payload: rima.payload}, 200)
})

export default rimas


