import { WaveKitResponse } from "@wavekit/kit";
import { wave } from "@wavekit/wave";

export function GET() {
	return WaveKitResponse.html(wave.p("Hello World!"));
}
