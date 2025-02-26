import { ssgRender } from "../src/server";
import path from "node:path";

ssgRender({ routesDir: path.join(process.cwd(), "test", "app"), outDir: path.join(process.cwd(), "test", "build") })