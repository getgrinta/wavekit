import { type Child, wave } from "@wavekit/wave";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

export function Layout(slot: Child) {
	return wave.html({ lang: "en" }, (html) => {
		html
			.head((head) => {
				head
					.meta({ charset: "UTF-8" })
					.meta({
						name: "viewport",
						content: "width=device-width, initial-scale=1.0",
					})
					.title("Wavekit")
					.link({
						rel: "stylesheet",
						href: "https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css",
					});
			})
			.body((body) => {
				body.main({ class: "container" }, [
					Navbar(),
					slot.toString(),
					Footer(),
				]);
			});
	});
}
