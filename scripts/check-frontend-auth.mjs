const base = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000"

for (const path of ["/api/auth/ok", "/api/account/health"]) {
  try {
    const response = await fetch(`${base}${path}`)
    const text = await response.text()
    console.log(`${path} -> ${response.status}`)
    console.log(text.slice(0, 1000))
  } catch (error) {
    console.error(`${path} -> FAILED`)
    console.error(error)
    process.exitCode = 1
  }
}
