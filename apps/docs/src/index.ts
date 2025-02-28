import { createWaveKit, ssgRender } from "@wavekit/kit";

if (process.env.NODE_ENV === "development") {
	createWaveKit({ base: "/wavekit" }).then(({ routes }) => {
		console.log("Serving on http://localhost:3000");
		Bun.serve({ port: 3000, routes });
	});
} else {
	ssgRender({ base: "/wavekit" });
}
