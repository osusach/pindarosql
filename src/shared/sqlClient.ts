import { createClient } from "@libsql/client/web";


export function sqlClient(env: Bindings) {
  const client = createClient({
    url: env.LIBSQL_URL,
    authToken: env.LIBSQL_TOKEN
  });
  return client
}