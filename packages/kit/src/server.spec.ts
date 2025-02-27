import { expect, it } from "bun:test";
import path from "node:path";
import { buildRoutes, createWaveKit } from "./server";

const TEST_DIR = path.join(__dirname, "..", "test", "app");

const FAKE_ROUTES = {
	"/": path.join(TEST_DIR, "index.test.ts"),
};

it("should prepare routes", async () => {
	const routes = await buildRoutes({ routes: FAKE_ROUTES });
	expect(routes["/"]).toHaveProperty("GET");
});

it("should create wavekit config", async () => {
	const routes = await createWaveKit({ routesDir: TEST_DIR });
	expect(routes["/index.test"]).toHaveProperty("GET");
});
