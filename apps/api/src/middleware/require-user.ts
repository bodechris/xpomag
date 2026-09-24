import type { NextFunction, Request, Response } from "express"
import { auth, fromNodeHeaders } from "../../../../packages/auth/src/index"

declare global {
  namespace Express {
    interface Request {
      xpomagUser?: {
        id: string
        email: string
        name?: string | null
      }
    }
  }
}

export async function requireUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })

  if (!session?.user) {
    return res.status(401).json({ error: "UNAUTHENTICATED" })
  }

  req.xpomagUser = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
  }

  next()
}
