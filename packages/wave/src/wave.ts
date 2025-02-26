export type Attributes = { [key: string]: string | boolean };

// Define callback type with explicit parameter type
export type ElementCallback<T extends Attributes = Attributes> = (
	element: HTMLElementProxy<T>,
	// biome-ignore lint/suspicious/noConfusingVoidType: actually needed
) => void | string | HTMLElementProxy<T> | null | undefined;
export type ChildElement<T extends Attributes = Attributes> =
	| string
	| ElementCallback<T>
	| HTMLElementProxy<T>;
export type Child<T extends Attributes = Attributes> =
	| ChildElement<T>
	| readonly ChildElement<T>[];

export interface ElementMethod<T extends Attributes = Attributes> {
	(attributes: T, child?: Child<T>): HTMLElementProxy<T>;
	(child?: Child<T>): HTMLElementProxy<T>;
}

export interface HTMLElementProxy<T extends Attributes = Attributes> {
	[key: string]: ElementMethod<T>;
}

const createElement = <T extends Attributes = Attributes>(
	tag: string,
	attributesOrChild?: T | Child<T>,
	child?: Child<T>,
	state?: { current: string; siblings: string[] },
): HTMLElementProxy<T> => {
	let attributes: T | undefined;
	let content = "";

	const processChild = (child: Child<T>): string => {
		if (typeof child === "function") {
			const proxy = createElement<T>("");
			// Use a type assertion to help TypeScript infer the parameter type
			const callback = child as ElementCallback<T>;
			callback(proxy);
			return proxy.toString();
		}
		if (typeof child === "string") {
			return child;
		}
		if (Array.isArray(child)) {
			return child.map((c) => processChild(c)).join("");
		}
		if (child && typeof child === "object" && "toString" in child) {
			return child.toString();
		}
		return "";
	};

	if (
		typeof attributesOrChild === "function" ||
		typeof attributesOrChild === "string" ||
		Array.isArray(attributesOrChild)
	) {
		content = processChild(attributesOrChild);
	} else if (attributesOrChild && typeof attributesOrChild === "object") {
		attributes = attributesOrChild as T;
	}

	if (child) {
		content += processChild(child);
	}

	const attrs = attributes
		? Object.entries(attributes)
				.map(([key, value]) =>
					typeof value === "boolean" && value ? key : `${key}="${value}"`,
				)
				.join(" ")
		: "";

	const elementState = state || { current: "", siblings: [] };

	return new Proxy<HTMLElementProxy<T>>({} as HTMLElementProxy<T>, {
		get: (target, prop: string): ElementMethod<T> => {
			if (prop === "toString") {
				if (!tag)
					return (() =>
						elementState.current +
						elementState.siblings.join("")) as unknown as ElementMethod<T>;

				const current = `<${tag}${attrs ? ` ${attrs}` : ""}>${content}</${tag}>`;
				if (state) {
					elementState.siblings.push(current);
					return (() =>
						elementState.current +
						elementState.siblings.join("")) as unknown as ElementMethod<T>;
				}
				return (() => current) as unknown as ElementMethod<T>;
			}

			const method = ((
				attrsOrChild?:
					| T
					| ElementCallback<T>
					| string
					| (string | HTMLElementProxy<T>)[],
				innerChild?:
					| ElementCallback<T>
					| string
					| (string | HTMLElementProxy<T>)[],
			): HTMLElementProxy<T> => {
				if (!tag) {
					// In callback context
					const element = createElement<T>(prop, attrsOrChild, innerChild);
					elementState.current += element.toString();
					return createElement<T>("", undefined, undefined, elementState);
				}
				// In chaining context
				const current = `<${tag}${attrs ? ` ${attrs}` : ""}>${content}</${tag}>`;
				const newState = {
					current: elementState.current + current,
					siblings: [],
				};
				const element = createElement<T>(
					prop,
					attrsOrChild,
					innerChild,
					newState,
				);
				return element;
			}) as ElementMethod<T>;
			return method;
		},
	});
};

export const buildWave = <
	T extends Attributes = Attributes,
>(): HTMLElementProxy<T> =>
	new Proxy<HTMLElementProxy<T>>(
		{ toString: () => "" } as HTMLElementProxy<T>,
		{
			get: (target, prop: string): ElementMethod<T> => {
				if (prop === "toString") {
					return (() => "") as unknown as ElementMethod<T>;
				}
				const method = ((
					attrsOrChild?:
						| T
						| ElementCallback<T>
						| string
						| (string | HTMLElementProxy<T>)[],
					child?:
						| ElementCallback<T>
						| string
						| (string | HTMLElementProxy<T>)[],
				): HTMLElementProxy<T> => {
					return createElement<T>(prop, attrsOrChild, child);
				}) as ElementMethod<T>;
				return method;
			},
		},
	);

export const wave: HTMLElementProxy<Attributes> = buildWave<Attributes>();
