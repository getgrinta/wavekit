import { wave } from "@wavekit/wave";

export function Footer() {
	const year = new Date().getFullYear();
	return wave.footer(
		{ style: "margin-top:6rem;" },
		`Copyright © ${year} WaveKit by <a href="https://getgrinta.com" target="_blank" rel="noopener noreferrer">Grinta</a>. All rights reserved.`,
	);
}
