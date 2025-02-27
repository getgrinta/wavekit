import type { WaveKitHandler } from "@wavekit/kit";

export const GET: WaveKitHandler = (c) => {
	return c.json({ hello: "world" });
};
