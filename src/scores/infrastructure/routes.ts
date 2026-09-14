import { Hono } from 'hono';
import { getLeaderboards } from '../application/getLeaderboard';
import { getPlayerHistory } from '../application/getPlayerHistory';
import { cors } from 'hono/cors';
import { sqlClient } from '../../shared/sqlClient';




const scores = new Hono<{ Bindings: Bindings }>()
scores.use("*", cors())

scores.get("/leaderboards", async (c) => {
  const conn = sqlClient(c.env)
  const leaderboards = await getLeaderboards(conn)
  return c.json(leaderboards, 200)
})

scores.post("/history", async (c) => {
  const conn = sqlClient(c.env)
  const body = await c.req.json()
  const leaderboards = await getPlayerHistory(body, c.env, conn)
  if (!leaderboards.success) {
    return c.json(leaderboards, 400)
  }
  return c.json(leaderboards, 200)
})

export default scores