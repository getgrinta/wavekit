import path from "node:path";
import { createWaveKit } from "../src";

createWaveKit({ routesDir: path.join(process.cwd(), "test", "app") }).then(
	(routes) => {
		Bun.serve({ routes });
	},
);
