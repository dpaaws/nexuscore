import request from "supertest"
import app from "../src/index"

describe("Auth middleware", () => {
  it("returns 401 with no API key", async () => {
    const res = await request(app).get("/api/v1/proxy")
    expect(res.status).toBe(401)
    expect(res.body.error).toBe("UNAUTHORIZED")
  })

  it("returns 401 with invalid API key", async () => {
    const res = await request(app)
      .get("/api/v1/proxy")
      .set("X-Api-Key", "fake-key")
    expect(res.status).toBe(401)
  })

  it("passes through with valid API key", async () => {
    const res = await request(app)
      .post("/api/v1/proxy")
      .set("X-Api-Key", "nexus-dev-key-001")
      .send({ target: "https://httpbin.org/get" })
    // 200 or 502 (network) — either means auth passed
    expect([200, 400, 502]).toContain(res.status)
  })

  it("allows /health without auth", async () => {
    const res = await request(app).get("/health")
    expect(res.status).toBe(200)
    expect(res.body.status).toBe("ok")
  })
})
