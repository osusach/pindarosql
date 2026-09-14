import jwt from '@tsndr/cloudflare-worker-jwt'
import { Optional } from './types';

type JWTCredentials = {
  user_id: number,
  is_admin: boolean
}

export async function authenticateJWT(token: string, env: Bindings): Promise<Optional<JWTCredentials>> {
  let isValid = false
  try {
    isValid = await jwt.verify(token, env.JWT_KEY);
  } catch (e) {
    isValid = false
  }
  if (!isValid) {
    return {
      message: "Given JWT is not valid!",
      content: null
    }
  }

  const credentials = jwt.decode(token)

  return {
    message: "Credentials retreived successfully!",
    content: credentials.payload! as JWTCredentials
  }

}