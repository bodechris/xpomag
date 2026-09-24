import express from "express"
import cors from "cors"
import { auth, toNodeHandler } from "@xpomag/auth"
import { accountRouter } from "./routes/account.js"

const app = express()
const port = Number(process.env.PORT ?? 4000)
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  }),
)

// IMPORTANT: Better Auth must be mounted before express.json().
// Express v5:
app.all("/api/auth/*splat", toNodeHandler(auth))
// Express v4 equivalent:
// app.all("/api/auth/*", toNodeHandler(auth))

app.use(express.json({ limit: "1mb" }))

app.use("/api/account", accountRouter)

app.listen(port, () => {
  console.log(`XPOMAG API running at http://localhost:${port}`)
})
