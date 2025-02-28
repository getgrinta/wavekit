import { expect, it } from "bun:test";
import path from "node:path";
import { createWaveKit } from "./server";

const TEST_DIR = path.join(__dirname, "..", "test", "app");

it("should create wavekit config", async () => {
	const { routes } = await createWaveKit({ routesDir: TEST_DIR });
	expect(routes["/html.test"]).toHaveProperty("GET");
});
