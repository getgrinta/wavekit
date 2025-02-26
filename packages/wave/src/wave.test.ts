import { expect, it } from "bun:test";
import dedent from "dedent";
import { wave } from "./wave";

const sanitize = (template: TemplateStringsArray) =>
	dedent(template).replace(/\s\s+/g, "").replace(/\n/, "");

it("renders a template without attributes", () => {
	const component = wave.div().toString();
	expect(component).toEqual("<div></div>");
});

it("renders a template without attributes, but with inner text", () => {
	const component = wave.div("Test").toString();
	expect(component).toEqual("<div>Test</div>");
});

it("renders a template without nesting", () => {
	const component = wave.div({ class: "flex" }).toString();
	expect(component).toEqual('<div class="flex"></div>');
});

it("renders self-closing tags correctly", () => {
	const output = wave.br().toString();
	expect(output).toEqual("<br></br>");
});

it("renders a template with boolean property", () => {
	const component = wave.input({ disabled: true }).toString();
	expect(component).toEqual("<input disabled></input>");
});

it("renders multiple parents", () => {
	const component = wave.div("foo").div("bar").div("baz").toString();
	expect(component).toEqual(
		sanitize`
      <div>foo</div>
	  <div>bar</div>
      <div>baz</div>
    `,
	);
});

it("renders a template with multiple properties", () => {
	const component = wave
		.input({ disabled: true, required: true, "aria-label": "username" })
		.toString();
	expect(component).toEqual(
		'<input disabled required aria-label="username"></input>',
	);
});

it("renders a template with inner text", () => {
	const component = wave.div({ class: "flex" }, "Wave").toString();
	expect(component).toEqual('<div class="flex">Wave</div>');
});

it("renders a template with nested component", () => {
	const child = wave.div({ class: "flex" }, "Wave");
	const parent = wave.div({ class: "flex" }, child).toString();
	expect(parent).toEqual(
		sanitize`
      <div class="flex">
        <div class="flex">Wave</div>
      </div>
    `,
	);
});

it("renders a template with multiple nested component", () => {
	const child1 = wave.div({ class: "flex" }, "Wave 1");
	const child2 = wave.div({ class: "flex" }, "Wave 2");
	const parent = wave.div({ class: "flex" }, [child1, child2]).toString();
	expect(parent).toEqual(
		sanitize`
      <div class="flex">
        <div class="flex">Wave 1</div>
        <div class="flex">Wave 2</div>
      </div>
    `,
	);
});

it("renders a template with multiple nested component as a loop result", () => {
	const output = wave
		.div({ class: "flex" }, (div) => {
			for (let i = 0; i < 5; i++) {
				div.p("Test");
			}
		})
		.toString();
	expect(output).toEqual(
		sanitize`
      <div class="flex">
        <p>Test</p>
        <p>Test</p>
        <p>Test</p>
        <p>Test</p>
        <p>Test</p>
      </div>
    `,
	);
});

it("allows nesting with just function", () => {
	const output = wave
		.body((body) => {
			body.button({ type: "submit" }, "Submit");
		})
		.toString();
	expect(output).toEqual(
		sanitize`
      <body>
        <button type="submit">Submit</button>
      </body>
    `,
	);
});

it("renders a template with deep nesting", () => {
	const output = wave
		.body({ class: "flex flex-col" }, (body) => {
			body.div({ class: "flex flex-col" }, (div) => {
				div.form({ class: "flex flex-col" }, (form) => {
					form.input({ name: "username", required: true });
					form.button({ type: "submit" }, "Submit");
				});
			});
		})
		.toString();
	expect(output).toEqual(
		sanitize`
      <body class="flex flex-col">
        <div class="flex flex-col">
          <form class="flex flex-col">
            <input name="username" required></input>
            <button type="submit">Submit</button>
          </form>
        </div>
      </body>
    `,
	);
});

it("allows element chaining with reference", () => {
	const output = wave
		.body((body) => {
			body.div((div) => {
				div.form((form) => {
					form
						.input({ name: "username", required: true })
						.button({ type: "submit" }, "Submit");
				});
			});
		})
		.toString();
	expect(output).toEqual(
		sanitize`
      <body>
        <div>
          <form>
            <input name="username" required></input>
            <button type="submit">Submit</button>
          </form>
        </div>
      </body>
    `,
	);
});

it("handles nested sibling chains", () => {
	const output = wave
		.div((div) => {
			div
				.p("First")
				.p("Second")
				.div((inner) => {
					inner.span("A").span("B");
				});
		})
		.toString();
	expect(output).toEqual(sanitize`
    <div>
      <p>First</p>
      <p>Second</p>
      <div>
        <span>A</span>
        <span>B</span>
      </div>  
    </div>
  `);
});

it("handles spread arrays of elements", () => {
	const items = ["A", "B", "C"].map((text) => wave.li(text));
	const output = wave.ul([...items]).toString();
	expect(output).toEqual(sanitize`
    <ul>
      <li>A</li>
      <li>B</li>
      <li>C</li>
    </ul>
  `);
});

it("handles nested conditional rendering", () => {
	const isAdmin = true;
	const isLoggedIn = true;
	const output = wave
		.div((div) => {
			if (isLoggedIn) {
				div.p("Welcome");
				if (isAdmin) {
					div.button("Admin Panel");
				}
			}
		})
		.toString();
	expect(output).toEqual(sanitize`
    <div>
      <p>Welcome</p>
      <button>Admin Panel</button>
    </div>
  `);
});

it("handles undefined/null children gracefully", () => {
	const maybeContent = undefined;
	const output = wave.div(maybeContent).toString();
	expect(output).toEqual(sanitize`
    <div></div>
  `);
});

it("handles complex attribute values", () => {
	const output = wave
		.div({
			style: "display: flex; gap: 1rem;",
			"data-custom": JSON.stringify({ foo: "bar" }),
			class: ["btn", "btn-primary"].join(" "),
		})
		.toString();
	expect(output).toEqual(
		'<div style="display: flex; gap: 1rem;" data-custom="{"foo":"bar"}" class="btn btn-primary"></div>',
	);
});

it("handles deeply nested sibling chains", () => {
	const output = wave
		.div((div) => {
			div.section((section) => {
				section
					.article("A")
					.article((article) => {
						article.h1("Title").p("Content");
					})
					.article("C");
			});
		})
		.toString();
	expect(output).toEqual(sanitize`
    <div>
      <section>
        <article>A</article>
        <article>
          <h1>Title</h1>
          <p>Content</p>
        </article>
        <article>C</article>
      </section>
    </div>
  `);
});

it("handles mixed child types", () => {
	const span = wave.span("Inline");
	const output = wave
		.div(["Text", span, (div) => div.p("Callback"), wave.br()] as const)
		.toString();
	expect(output).toEqual(
		"<div>Text<span>Inline</span><p>Callback</p><br></br></div>",
	);
});

it("renders a template with conditional rendering", () => {
	const isLoggedIn = true;
	const output = wave
		.div((div) => {
			if (isLoggedIn) {
				div.p("Welcome back!");
			} else {
				div.a({ href: "/login" }, "Please log in");
			}
		})
		.toString();
	expect(output).toEqual(
		sanitize`
      <div>
        <p>Welcome back!</p>
      </div>
    `,
	);
});

it("renders a template with dynamic attributes", () => {
	const buttonType = "primary";
	const output = wave
		.button(
			{
				class: `btn btn-${buttonType}`,
				"data-type": buttonType,
			},
			"Click me",
		)
		.toString();
	expect(output).toEqual(
		'<button class="btn btn-primary" data-type="primary">Click me</button>',
	);
});

it("renders a list of items", () => {
	const items = ["Apple", "Banana", "Cherry"];
	const output = wave
		.ul((ul) => {
			for (const item of items) {
				ul.li(item);
			}
		})
		.toString();
	expect(output).toEqual(
		sanitize`
      <ul>
        <li>Apple</li>
        <li>Banana</li>
        <li>Cherry</li>
      </ul>
    `,
	);
});

it("handles event attributes", () => {
	const output = wave
		.button(
			{
				onclick: "handleClick()",
				onmouseover: "handleMouseOver()",
			},
			"Interactive Button",
		)
		.toString();
	expect(output).toEqual(
		'<button onclick="handleClick()" onmouseover="handleMouseOver()">Interactive Button</button>',
	);
});
