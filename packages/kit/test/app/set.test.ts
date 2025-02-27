import type { WaveKitHandler } from "@wavekit/kit";

export const GET: WaveKitHandler = async (c) => {
	c.store.set("hello", "world");
	return c.json({ hello: c.store.get("hello") });
};
