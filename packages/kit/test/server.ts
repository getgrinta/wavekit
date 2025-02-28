import path from "node:path";
import { type WaveKitHooks, createWaveKit } from "../src";

const hooksEnabled = false;

const hooks: WaveKitHooks = {
	async beforeHandler(c) {
		if (hooksEnabled) {
			// Explicitly return a Response
			return c.json({ hooks: "work" });
		}
		// Explicitly return the context
		return c;
	},
};

createWaveKit({
	routesDir: path.join(process.cwd(), "test", "app"),
	publicDir: path.join(process.cwd(), "test", "public"),
	hooks,
}).then(({ routes }) => {
	Bun.serve({ routes });
});
