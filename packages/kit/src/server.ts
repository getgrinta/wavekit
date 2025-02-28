import path from "node:path";
import type { BunRequest, RouterTypes, Server } from "bun";
import { WaveKitResponse } from "./response";

const isDev = process.env.NODE_ENV === "development";

const defaultRoutesDir = isDev
	? path.join(process.cwd(), "app")
	: path.join(process.cwd(), "build", "app");

const defaultOutDir = path.join(process.cwd(), "build");

export type WaveKitContext = {
	req: BunRequest;
	res: WaveKitResponse;
	html: typeof WaveKitResponse.html;
	json: typeof WaveKitResponse.json;
	redirect: typeof WaveKitResponse.redirect;
	store: Map<string, unknown>;
	base: string;
};

export type WaveKitHandler = (
	c: WaveKitContext,
) => WaveKitResponse | Promise<WaveKitResponse>;

export type WaveKit = {
	routes: Record<string, RouterTypes.RouteHandlerObject<string>>;
	store: Map<string, unknown>;
};

export type WaveKitHooks = {
	beforeHandler?: (
		c: WaveKitContext,
	) => Promise<WaveKitContext | WaveKitResponse>;
	afterHandler?: (response: WaveKitResponse) => Promise<WaveKitResponse>;
};

export type CreateWaveKitProps = {
	base?: string | undefined;
	routesDir?: string | undefined;
	hooks?: WaveKitHooks;
};

export async function createWaveKit({
	base,
	routesDir,
	hooks,
}: CreateWaveKitProps = {}): Promise<WaveKit> {
	const safeBase = (base ?? "/") === "/" ? "" : (base ?? "");
	const router = new Bun.FileSystemRouter({
		style: "nextjs",
		dir: routesDir ?? defaultRoutesDir,
		assetPrefix: "_public",
	});
	const contextStore = new Map();
	const rawRoutes = Object.entries(router.routes);
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
			contextHandler[method as RouterTypes.HTTPMethod] = async (
				req: BunRequest,
				server: Server,
			) => {
				const res = new WaveKitResponse();
				let context = {
					req,
					res,
					html: WaveKitResponse.html,
					json: WaveKitResponse.json,
					redirect: WaveKitResponse.redirect,
					store: contextStore,
					base: safeBase,
				};
				let beforeHandlerResult: WaveKitResponse | WaveKitContext;
				if (hooks?.beforeHandler) {
					beforeHandlerResult = await hooks.beforeHandler(context);
					if (beforeHandlerResult instanceof Response)
						return beforeHandlerResult;
					context = beforeHandlerResult as WaveKitContext;
				}
				let result: WaveKitResponse = new WaveKitResponse();
				result = await methodHandler(context);
				if (
					hooks?.afterHandler &&
					result &&
					result instanceof WaveKitResponse
				) {
					result = await hooks.afterHandler(result);
				}
				return result;
			};
		}
		return [safeBase + path, contextHandler];
	});
	const filteredRoutes = Object.fromEntries(
		(await Promise.all(routesWithHandlers)).filter(Boolean) as [
			string,
			RouterTypes.RouteHandlerObject<string>,
		][],
	);
	return {
		routes: filteredRoutes,
		store: contextStore,
	};
}

function sanitizeRoutePath(routePath: string) {
	const addIndex = routePath.split("/").slice(-1)[0] === "";
	return addIndex ? `${routePath}index` : routePath;
}

export type SsgRenderProps = {
	base?: string | undefined;
	routesDir?: string | undefined;
	outDir?: string | undefined;
};

export async function ssgRender({
	base,
	routesDir,
	outDir,
}: SsgRenderProps = {}) {
	const { routes } = await createWaveKit({ base, routesDir });
	const server = Bun.serve({
		port: 3000,
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
