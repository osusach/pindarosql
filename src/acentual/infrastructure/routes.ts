import { Hono } from 'hono';
import { startGame } from '../application/startGame';
import { connect, Config } from "@planetscale/database";
import { submitAnswers } from '../application/submitAnswers';
import { addAcentual } from '../application/addAcentual';
import { cors } from 'hono/cors';
import { getAllAcentuales } from '../application/getAllAcentuales';
import { deleteAcentuales } from '../application/deleteAcentuales';
import { activateAcentuales } from '../application/activateAcentuales';
import { sqlClient } from '../../shared/sqlClient';



const acentual = new Hono<{ Bindings: Bindings }>()

acentual.use("*", cors())

acentual.get("/start/:difficulty", async (c) => {
  const conn = sqlClient(c.env)
  const diff = parseInt(c.req.param("difficulty"))
  const game = await startGame(diff, conn)
  if (!game.success) {
    return c.json({success: false, message: game.message, payload: null}, 400)
  }
  return c.json({success: true, message: game.message, payload: game.payload}, 200)
})

acentual.post("/submit", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const submit = await submitAnswers(body, c.env, conn)
  if (!submit.success) {
    return c.json({success: false, message: submit.message, payload: submit.payload}, 400)
  }
  return c.json({success: true, message: submit.message, payload: submit.payload}, 200)
  
})


acentual.post("/uploadAcentual", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const upload = await addAcentual(body, c.env, conn)
  if (!upload.success) {
    return c.json({success: false, message: upload.message, payload: null}, 400)
  }
  return c.json({success: true, message: upload.message, payload: upload.payload}, 200)
})

acentual.post("/allAcentuales", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const acentuales = await getAllAcentuales(body, c.env, conn)
  if (!acentuales.success) {
    return c.json({success: false, message: acentuales.message, payload: null}, 400)
  }
  return c.json({success: true, message: acentuales.message, payload: acentuales.payload}, 200)
})

acentual.post("/deleteAcentuales", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const acentuales = await deleteAcentuales(body, c.env, conn)
  if (!acentuales.success) {
    return c.json({success: false, message: acentuales.message, payload: null}, 400)
  }
  return c.json({success: true, message: acentuales.message, payload: acentuales.payload}, 200)
})

acentual.post("/activateAcentuales", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const acentuales = await activateAcentuales(body, c.env, conn)
  if (!acentuales.success) {
    return c.json({success: false, message: acentuales.message, payload: null}, 400)
  }
  return c.json({success: true, message: acentuales.message, payload: null}, 200)
})


export default acentual


