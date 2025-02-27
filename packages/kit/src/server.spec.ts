import { expect, it } from "bun:test";
import path from "node:path";
import { buildRoutes, createWaveKit } from "./server";

const TEST_DIR = path.join(__dirname, "..", "test", "app");

const FAKE_ROUTES = {
	"/html.test": path.join(TEST_DIR, "html.test.ts"),
};

it("should prepare routes", async () => {
	const routes = await buildRoutes({ routes: FAKE_ROUTES });
	expect(routes["/html.test"]).toHaveProperty("GET");
});

it("should create wavekit config", async () => {
	const routes = await createWaveKit({ routesDir: TEST_DIR });
	expect(routes["/html.test"]).toHaveProperty("GET");
});
