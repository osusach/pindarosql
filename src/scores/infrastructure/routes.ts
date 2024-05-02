import { Hono } from 'hono';
import { connect, Config } from "@planetscale/database";
import { getLeaderboards } from '../application/getLeaderboard';
import { getPlayerHistory } from '../application/getPlayerHistory';
import { cors } from 'hono/cors';
import { sqlClient } from '../../shared/sqlClient';




export function getDatabaseConfig(env: Bindings) {
  return {
    host: env.DB_HOST,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    fetch: (url: string, init: RequestInit<RequestInitCfProperties>) => {
      delete (init as any)["cache"]; // Remove cache header
      return fetch(url, init);
    },
  } as Config;
}

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