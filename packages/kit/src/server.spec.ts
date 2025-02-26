import { it, expect } from "bun:test"
import { buildRoutes, createWaveKit } from "./server"
import path from "node:path"

const TEST_DIR = path.join(process.cwd(), "test", "app")

const FAKE_ROUTES = {
    "/": path.join(TEST_DIR, "test.ts"),
}

it("should prepare routes", async () => {
    const routes = await buildRoutes({ routes: FAKE_ROUTES })
    expect(routes["/"]).toHaveProperty("GET")
})

it("should create wavekit config", async () => {
    const routes = await createWaveKit({ routesDir: TEST_DIR })
    expect(routes["/test"]).toHaveProperty("GET")
})
