import { expect, it } from "bun:test";
import path from "node:path";
import { createWaveKit } from "./server";

const TEST_ROUTES_DIR = path.join(__dirname, "..", "test", "app");
const TEST_PUBLIC_DIR = path.join(__dirname, "..", "test", "public");

it("should create wavekit config", async () => {
	const { routes } = await createWaveKit({
		routesDir: TEST_ROUTES_DIR,
		publicDir: TEST_PUBLIC_DIR,
	});
	expect(routes["/html.test"]).toHaveProperty("GET");
});
