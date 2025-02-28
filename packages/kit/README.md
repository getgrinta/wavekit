# @wavekit/kit

The server side of WaveKit.

## Usage

```ts
import { createWaveKit, type WaveKitHooks } from "@wavekit/kit";
import { findUserByToken } from "./src/auth";

const hooks: WaveKitHooks = {
	async beforeHandler(c) {
		const bearerToken = c.req.headers.get("Authorization")?.split(" ")?.[1];
		if (!bearerToken) {
			return c.json({ error: "Unauthorized" }, 401);
		}
        const user = await findUserByToken(bearerToken);
        if (!user) {
            return c.json({ error: "Unauthorized" }, 401);
        }
        c.set("user", user);
	},
};

createWaveKit({ hooks }).then(({ routes }) => {
	console.log("Serving on http://localhost:3000");
	Bun.serve({
		port: 3000,
		routes,
		development: process.env.NODE_ENV === "development",
	});
});
```
