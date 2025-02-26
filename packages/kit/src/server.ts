import type { RouterTypes } from "bun"
import path from "node:path";

const isDev = process.env.NODE_ENV === "development";

const defaultRoutesDir =
	isDev
		? path.join(process.cwd(), "app")
		: path.join(process.cwd(), "build", "app")

const defaultOutDir = path.join(process.cwd(), "build")

type BuildRoutesProps = {
	routes: Record<string, string>
}

export async function buildRoutes({ routes }: BuildRoutesProps): Promise<Record<string, RouterTypes.RouteHandlerObject<string>>> {
	const rawRoutes = Object.entries(routes);
	const routesWithHandlers = rawRoutes.map(async ([path, handlerPath]) => {
		return [path, await import(handlerPath)];
	});
	return Object.fromEntries(await Promise.all(routesWithHandlers));
}

type CreateWaveKitProps = {
	routesDir?: string | undefined
}

export async function createWaveKit({ routesDir }: CreateWaveKitProps = {}) {
	const router = new Bun.FileSystemRouter({
		style: "nextjs",
		dir: routesDir ?? defaultRoutesDir,
		assetPrefix: "_public",
	});
	return buildRoutes({ routes: router.routes })
}

function sanitizeRoutePath(routePath: string) {
	const addIndex = routePath.split("/").slice(-1)[0] === "";
	return addIndex ? `${routePath}index` : routePath;
}

type SsgRenderProps = {
	routesDir?: string | undefined
	outDir?: string | undefined
}

export async function ssgRender({ routesDir, outDir }: SsgRenderProps = {}) {
	const routes = await createWaveKit({ routesDir })
	const server = Bun.serve({
		routes,
	})
	let renderedRoutes = 0
	await Promise.all(Object.entries(routes).map(async ([routePath, handler]) => {
		if (handler.GET) {
			const response = await fetch(`http://localhost:3000${routePath}`)
			if (response.headers.get("Content-Type") !== "text/html") return
			const html = await response.text()
			const fileName = sanitizeRoutePath(routePath)
			const fullPath = path.join(outDir ?? defaultOutDir, fileName)
			const fullPathExt = `${fullPath}.html`
			await Bun.write(fullPathExt, html)
			renderedRoutes++
		}
	}))
	await server.stop()
	console.log(`Rendered ${renderedRoutes} route(s) to ${outDir ?? defaultOutDir}`)
}
