import { WaveKitResponse } from "@wavekit/kit";
import { wave } from "@wavekit/wave";
import type { BunRequest } from "bun";
import dedent from "dedent";
import { createHighlighter } from "shiki";
import { Layout } from "../src/components/layout";

const waveKitServerCode = dedent`
	// src/index.ts
	import { createWaveKit } from "@wavekit/kit"

	createWaveKit().then((routes) => {
		console.log("Serving on http://localhost:3000")
		Bun.serve({ port: 3000, routes })
	})
`;

const waveKitAppCode = dedent`
	// app/index.ts
	import { wave } from "@wavekit/wave";
	import { WaveKitResponse } from "@wavekit/kit";

	export function GET(req: BunRequest) {
		return WaveKitResponse.html(
			wave.article({ class: "container mx-auto" }, (article) => {
				article
					.h1("WaveKit is awesome.")
					.p("Write your templates with lightweight engine (<150 LOC).")
					.p("Create templates without separate JSX and TSX files.")
			})
		)
	}
`;

export async function GET(req: BunRequest) {
	const highlighter = await createHighlighter({
		themes: ["github-dark"],
		langs: ["typescript"],
	});
	return WaveKitResponse.html(
		Layout(
			wave.div({ style: "margin-top: 6rem;" }, (div) => {
				div
					.h1("The minimalist Bun web framework.")
					.p("WaveKit is a tiny framework built on top of Bun HTTP.")
					.h2("Features")
					.ul((ul) => {
						ul.li("Next.js style routing")
							.li("Zero extra dependencies")
							.li("Lightweight templating engine")
							.li("Works flawlessly with HTMX and Alpine.js");
					})
					.div({ style: "margin-top: 6rem;" }, (div) => {
						div
							.h2("Getting started")
							.p("The kit is a web server library. Use it like:")
							.h3("Install")
							.code("bun add @wavekit/wave @wavekit/kit")
							.h3("Usage")
							.div(
								highlighter.codeToHtml(waveKitServerCode, {
									lang: "typescript",
									theme: "github-dark",
								}),
							)
							.div(
								highlighter.codeToHtml(waveKitAppCode, {
									lang: "typescript",
									theme: "github-dark",
								}),
							);
					});
			}),
		),
	);
}
