import { wave } from "@wavekit/wave";

export function Footer() {
	const year = new Date().getFullYear();
	return wave.footer(
		{ style: "margin-top:6rem;" },
		`Copyright © ${year} WaveKit. All rights reserved.`,
	);
}
