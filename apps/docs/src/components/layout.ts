import { type Child, wave } from "@wavekit/wave";
import dedent from "dedent";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function Layout({ base }: { base: string }, slot: Child) {
	return wave.html({ lang: "en" }, (html) => {
		html
			.head((head) => {
				head
					.meta({ charset: "UTF-8" })
					.meta({
						name: "viewport",
						content: "width=device-width, initial-scale=1.0",
					})
					.title("Wavekit - The salty hair of the web")
					.link({
						rel: "stylesheet",
						href: "https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.cyan.min.css",
					})
					.link({
						rel: "icon",
						type: "image/svg+xml",
						href: `${base}/favicon.svg`,
					});
			})
			.body((body) => {
				body.main({ class: "container" }, [
					Navbar({ base }),
					slot.toString(),
					Footer(),
				]);
			});
	});
}
