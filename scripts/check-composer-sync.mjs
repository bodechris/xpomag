const api = process.env.API_ORIGIN || "http://localhost:4000";
const issue = "demo-johannesburg-001";
const page = "cover";

for (const path of ["/health", "/v1/composer-health", `/v1/composer/${issue}/${page}`]) {
  try {
    const response = await fetch(`${api}${path}`, { cache: "no-store" });
    const body = await response.text();
    console.log(`\n${path} -> ${response.status}`);
    console.log(body.slice(0, 4000));
  } catch (error) {
    console.error(`\n${path} -> FAILED`, error);
  }
}
