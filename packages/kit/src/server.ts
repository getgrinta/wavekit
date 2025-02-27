import path from "node:path";
import type { BunRequest, RouterTypes, Server } from "bun";
import { WaveKitResponse } from "./response";

const isDev = process.env.NODE_ENV === "development";

const defaultRoutesDir = isDev
	? path.join(process.cwd(), "app")
	: path.join(process.cwd(), "build", "app");

const defaultOutDir = path.join(process.cwd(), "build");

type WaveKitContext = {
	req: BunRequest;
	res: WaveKitResponse;
	html: typeof WaveKitResponse.html;
	json: typeof WaveKitResponse.json;
};

export type WaveKitHandler = (
	c: WaveKitContext,
) => Response | Promise<Response>;

type BuildRoutesProps = {
	routes: Record<string, string>;
};

export async function buildRoutes({
	routes,
}: BuildRoutesProps): Promise<
	Record<string, RouterTypes.RouteHandlerObject<string>>
> {
	const contextStore = new Map();
	const rawRoutes = Object.entries(routes);
	const routesWithHandlers = rawRoutes.map(async ([path, handlerPath]) => {
		const handler = (await import(
			handlerPath
		)) as RouterTypes.RouteHandlerObject<string>;
		const contextHandler: RouterTypes.RouteHandlerObject<string> = {};
		for (const method of Object.keys(handler)) {
			const methodHandler = handler[
				method as RouterTypes.HTTPMethod
			] as unknown as WaveKitHandler;
			if (!methodHandler) return;
			contextHandler[method as RouterTypes.HTTPMethod] = (
				req: BunRequest,
				server: Server,
			) => {
				const res = new WaveKitResponse();
				const context = {
					req,
					res,
					html: WaveKitResponse.html,
					json: WaveKitResponse.json,
					redirect: WaveKitResponse.redirect,
					set: contextStore.set,
					get: contextStore.get,
				};
				return methodHandler(context);
			};
		}
		return [path, contextHandler];
	});
	return Object.fromEntries(
		(await Promise.all(routesWithHandlers)).filter(Boolean) as [
			string,
			RouterTypes.RouteHandlerObject<string>,
		][],
	);
}

export type CreateWaveKitProps = {
	routesDir?: string | undefined;
};

export async function createWaveKit({ routesDir }: CreateWaveKitProps = {}) {
	const router = new Bun.FileSystemRouter({
		style: "nextjs",
		dir: routesDir ?? defaultRoutesDir,
		assetPrefix: "_public",
	});
	return buildRoutes({ routes: router.routes });
}

function sanitizeRoutePath(routePath: string) {
	const addIndex = routePath.split("/").slice(-1)[0] === "";
	return addIndex ? `${routePath}index` : routePath;
}

export type SsgRenderProps = {
	routesDir?: string | undefined;
	outDir?: string | undefined;
};

export async function ssgRender({ routesDir, outDir }: SsgRenderProps = {}) {
	const routes = await createWaveKit({ routesDir });
	const server = Bun.serve({
		routes,
	});
	let renderedRoutes = 0;
	await Promise.all(
		Object.entries(routes).map(async ([routePath, handler]) => {
			if (handler.GET) {
				const response = await fetch(`http://localhost:3000${routePath}`);
				if (response.headers.get("Content-Type") !== "text/html") return;
				const html = await response.text();
				const fileName = sanitizeRoutePath(routePath);
				const fullPath = path.join(outDir ?? defaultOutDir, fileName);
				const fullPathExt = `${fullPath}.html`;
				await Bun.write(fullPathExt, html);
				renderedRoutes++;
			}
		}),
	);
	await server.stop();
	console.log(
		`Rendered ${renderedRoutes} route(s) to ${outDir ?? defaultOutDir}`,
	);
}
