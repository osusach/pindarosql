import { Client } from "@libsql/client/web";
import { v4 } from 'uuid'
export async function createSession(difficulty: number, gameType: number, db: Client) {
  const sessionId = v4()

  const query = await db.execute(`
    INSERT INTO GameSession (id, difficulty, game_type_id) VALUES ("${sessionId}", ${difficulty}, ${gameType});
  `);

  if (query.rowsAffected != 1) {
    return {
      success: false,
      payload: {message: "Error creating session", session_id: null}
    }
  }
  return {
    success: true,
    payload: {message: "Session created successfully", session_id: sessionId}
  }
}
