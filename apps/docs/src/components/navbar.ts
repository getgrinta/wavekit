import { wave } from "@wavekit/wave";

const Logo = wave.li((li) =>
	li.a({ href: "/wavekit", style: "font-weight: semibold;" }, "WaveKit"),
);

const NavItem = ({
	href,
	label,
	target = "_self",
	rel = "",
}: { href: string; label: string; target?: string; rel?: string }) => {
	return wave.li((li) => li.a({ href, target, rel }, label));
};

export const Navbar = () =>
	wave.nav((nav) => {
		nav.ul([Logo]).ul([
			NavItem({ href: "/wavekit/docs", label: "Docs" }),
			NavItem({
				href: "https://github.com/getgrinta/wavekit",
				label: "GitHub",
				target: "_blank",
				rel: "noopener noreferrer",
			}),
		]);
	});
