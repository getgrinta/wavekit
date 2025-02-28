import { type WaveKitHandler, WaveKitResponse } from "@wavekit/kit";
import { wave } from "@wavekit/wave";
import dedent from "dedent";
import { createHighlighter } from "shiki";
import { Layout } from "../src/components/layout";

const waveKitServerCode = dedent`
	// src/index.ts
	import { createWaveKit } from "@wavekit/kit"

	createWaveKit().then(({ routes }) => {
		console.log("Serving on http://localhost:3000")
		Bun.serve({ port: 3000, routes })
	})
`;

const waveKitAppCode = dedent`
	// app/index.ts
	import { wave } from "@wavekit/wave";
	import type { WaveKitHandler } from "@wavekit/kit";

	export const GET: WaveKitHandler = (c) => {
		return c.html(
			wave.article({ class: "container mx-auto" }, (article) => {
				article
					.h1("WaveKit is awesome.")
					.p("Write your templates with lightweight engine (<150 LOC).")
					.p("Create templates without separate JSX and TSX files.")
			})
		)
	}
`;

const waveKitWaveCode = dedent`
	// src/components/form.tsx
	import { wave } from "@wavekit/wave";

	export const SignUpForm = wave.form({
		method: "POST",
		action: "/api/sign-up",
		class: "flex flex-col gap-2",
	}, (signUpForm) => {
		signUpForm
			.h1("Sign Up")
			.label({ for: "usernameField", class: "label" }, "Username")
			.input({ id: "usernameField", name: "username", required: true, class: "input" })
			.label({ for: "emailField", class: "label" }, "Email")
			.input({ id: "emailField", name: "email", type: "email", required: true, class: "input" })
			.label({ for: "passwordField", class: "label" }, "Password")
			.input({ id: "passwordField", name: "password", type: "password", required: true, class: "input" })
			.label({ for: "termsField", class: "label" }, "I agree to the terms")
			.input({ type: "checkbox", name: "terms", required: true, class: "checkbox" })
			.button({ type: "submit", class: "btn btn-primary" }, "Sign Up");
	})
`;

const waveKitKitCode = dedent`
	// src/index.ts
	import { createWaveKit, ssgRender, type WaveKitHooks } from "@wavekit/kit";
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
			c.store.set("user", user);
		},
	};

	// Option 1: For serving
	createWaveKit({ hooks }).then(({ routes }) => {
		console.log("Serving on http://localhost:3000");
		Bun.serve({
			port: 3000,
			routes,
			development: process.env.NODE_ENV === "development",
		});
	});

	// Option 2: For static generation
	ssgRender()
`;

export const GET: WaveKitHandler = async (c) => {
	const highlighter = await createHighlighter({
		themes: ["github-dark"],
		langs: ["typescript"],
	});
	return WaveKitResponse.html(
		Layout(
			{ base: c.base },
			wave
				.div({ style: "margin-top: 6rem;" }, (heroDiv) => {
					heroDiv
						.h1("The minimalist Bun web framework.")
						.p(
							"WaveKit is a tiny framework built on top of Bun HTTP. Bleeding edge.",
						)
						.h2("Features")
						.ul((ul) => {
							ul.li("Next.js pages style routing")
								.li("API inspired by Hono")
								.li("Zero extra dependencies")
								.li("Lightweight templating engine")
								.li("Works flawlessly with HTMX and Alpine.js");
						});
				})
				.div({ style: "margin-top: 6rem;" }, (gettingStartedDiv) => {
					gettingStartedDiv
						.h2(
							wave
								.a(
									{ href: "#gettingStarted", id: "gettingStarted" },
									"Getting started",
								)
								.toString(),
						)
						.p("The kit is a web server library. Use it like:")
						.h3("Install")
						.code("bun add @wavekit/wave @wavekit/kit")
						.p({ style: "margin-top: 1rem;" }, "Nightly release:")
						.code(
							"bun add https://pkg.pr.new/getgrinta/wavekit/wave@main https://pkg.pr.new/getgrinta/wavekit/kit@main",
						)
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
				})
				.div({ style: "margin-top: 6rem;" }, (waveDiv) => {
					waveDiv
						.h2(wave.a({ href: "#wave", id: "wave" }, "🌊 Wave").toString())
						.p(
							"Wave is a lightweight templating engine built on top of Bun. You can just do things.",
						)
						.div(
							highlighter.codeToHtml(waveKitWaveCode, {
								lang: "typescript",
								theme: "github-dark",
							}),
						);
				})
				.div({ style: "margin-top: 6rem;" }, (kitDiv) => {
					kitDiv
						.h2(wave.a({ href: "#kit", id: "kit" }, "🧰 Kit").toString())
						.p("Kit is a web server library. Use it like:")
						.div(
							highlighter.codeToHtml(waveKitKitCode, {
								lang: "typescript",
								theme: "github-dark",
							}),
						);
				}),
		),
	);
};
