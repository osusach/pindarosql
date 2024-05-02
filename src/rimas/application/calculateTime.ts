import { Client } from "@libsql/client/web";

function msToTime(duration: number) {
  let seconds = Math.floor((duration / 1000) % 60)
  let minutes = Math.floor((duration / (1000 * 60)) % 60)
  let hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  const hoursStr = (hours < 10) ? "0" + hours : hours;
  const minutesStr = (minutes < 10) ? "0" + minutes : minutes;
  const secondsStr = (seconds < 10) ? "0" + seconds : seconds;

  return hoursStr + ":" + minutesStr + ":" + secondsStr;
}

export async function calculateTime(prevTime: Date, db: Client) {
  
  const currentTimeQuery = await db.execute('SELECT CURRENT_TIMESTAMP time;')
  const currentTime = currentTimeQuery.rows[0] as {time: Date}
  const startTime = new Date(prevTime)
  const finishDate = new Date(currentTime.time)
  const ms = finishDate.getTime() - startTime.getTime()

  return msToTime(ms)
}