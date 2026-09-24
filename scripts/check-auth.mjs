const api = process.env.API_ORIGIN ?? "http://localhost:4000"

async function check(path) {
  try {
    const res = await fetch(`${api}${path}`)
    const body = await res.text()
    console.log(`\n${path}`)
    console.log(`status: ${res.status}`)
    console.log(body.slice(0, 1200))
  } catch (error) {
    console.error(`\n${path}`)
    console.error(error)
  }
}

await check("/api/auth/ok")
await check("/api/auth-health")
