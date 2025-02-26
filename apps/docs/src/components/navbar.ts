import { wave } from "@wavekit/wave";

const Logo = wave.li((li) =>
	li.a({ href: "/", style: "font-weight: semibold;" }, "WaveKit"),
);

const NavItem = ({ href, label }: { href: string; label: string }) => {
	return wave.li((li) =>
		li.a({ href, target: "_blank", rel: "noopener noreferrer" }, label),
	);
};

export const Navbar = () =>
	wave.nav((nav) => {
		nav.ul([Logo]).ul([
			NavItem({
				href: "https://github.com/getgrinta/wavekit",
				label: "GitHub",
			}),
		]);
	});
