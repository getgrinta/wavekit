import path from "node:path";
import { ssgRender } from "../src/server";

ssgRender({
	routesDir: path.join(process.cwd(), "test", "app"),
	outDir: path.join(process.cwd(), "test", "build"),
});
