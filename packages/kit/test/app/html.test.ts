import type { WaveKitHandler } from "@wavekit/kit";
import { wave } from "@wavekit/wave";

export const GET: WaveKitHandler = (c) => {
	return c.html(wave.p("Hello World!"));
};
