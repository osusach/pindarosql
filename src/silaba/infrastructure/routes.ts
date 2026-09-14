import { Hono } from 'hono';
import { startGame } from '../application/startGame';
import { connect, Config } from "@planetscale/database";
import { submitAnswers } from '../application/submitAnswers';
import { addSilaba } from '../application/addSilaba';
import { importSilabas } from '../application/importSilabas';
import { getAllSilabas } from '../application/getAllSilabas';
import { deleteSilabas } from '../application/deleteSilabas';
import { activateSilabas } from '../application/activateSilabas';
import { editSilaba } from '../application/editSilabas';
import { sqlClient } from '../../shared/sqlClient';



const silabas = new Hono<{ Bindings: Bindings }>()

silabas.get("/start/:difficulty", async (c) => {
  const conn = sqlClient(c.env)
  const diff = parseInt(c.req.param("difficulty"))
  const game = await startGame(diff, conn)
  if (!game.success) {
    return c.json({success: false, message: game.message, payload: null}, 400)
  }
  return c.json({success: true, message: game.message, payload: game.payload}, 200)
})

silabas.post("/submit", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const submit = await submitAnswers(body, c.env, conn)
  if (!submit.success) {
    return c.json({success: false, message: submit.message, payload: null}, 400)
  }
  return c.json({success: true, message: submit.message, payload: submit.payload}, 200)
  
})

silabas.post("/uploadSilaba", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const upload = await addSilaba(body, c.env, conn)
  if (!upload.success) {
    return c.json({success: false, message: upload.message, payload: null}, 400)
  }
  return c.json({success: true, message: upload.message, payload: upload.payload}, 200)

})


silabas.post("/importSilabas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const upload = await importSilabas(body, c.env, conn)
  if (!upload.success) {
    return c.json({success: false, message: upload.message, payload: upload.payload}, 400)
  }
  return c.json({success: true, message: upload.message, payload: upload.payload}, 200)
})


silabas.post("/allSilabas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const silabas = await getAllSilabas(body, c.env, conn)
  if (!silabas.success) {
    return c.json({success: false, message: silabas.message, payload: null}, 400)
  }
  return c.json({success: true, message: silabas.message, payload: silabas.payload}, 200)
})

silabas.post("/deleteSilabas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const silabas = await deleteSilabas(body, c.env, conn)
  if (!silabas.success) {
    return c.json({success: false, message: silabas.message, payload: null}, 400)
  }
  return c.json({success: true, message: silabas.message, payload: silabas.payload}, 200)
})

silabas.post("/activateSilabas", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const silabas = await activateSilabas(body, c.env, conn)
  if (!silabas.success) {
    return c.json({success: false, message: silabas.message, payload: null}, 400)
  }
  return c.json({success: true, message: silabas.message, payload: silabas.payload}, 200)
})

silabas.post("/editSilaba", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const silaba = await editSilaba(body, c.env, conn)
  if (!silaba.success) {
    return c.json({success: false, message: silaba.message, payload: null}, 400)
  }
  return c.json({success: true, message: silaba.message, payload: silaba.payload}, 200)
})

export default silabas


