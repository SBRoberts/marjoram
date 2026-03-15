import { fireEvent, getAllByTestId, getByTestId } from "@testing-library/dom";

import { html } from "../../src";
const TEST_ID = 12345;

describe("Basic View Rendering", () => {
  beforeAll(() => {
    // global.window = global;
  });
  beforeEach(() => {
    document.body.innerHTML = "";
  });
  test("should render a static view with a ref", () => {
    const ref = "heading";
    const text = "Hello, world!";

    const element = html`<h1 ref="${ref}" data-testid="${TEST_ID}">
      ${text}
    </h1>`;
    document.body.append(element);

    const domElement = getByTestId(document.body, TEST_ID);
    expect(domElement).toBeInTheDocument();
    expect(domElement).toHaveTextContent(text);

    const elementCollection = element.collect();

    expect(elementCollection).toHaveProperty(ref, domElement);
    expect(elementCollection[ref] instanceof HTMLHeadingElement).toBe(true);
  });

  test("should render a static view with an array argument", () => {
    const ref = "list";
    const listItemText = [`item 1`, `item 2`, `item 3`];

    const listItemViews = html`${listItemText.map(
      item => html`<li data-testid="${TEST_ID}">${item}</li>`
    )}`;

    const listView = html` <ul ref="${ref}">
      ${listItemViews}
    </ul>`;
    document.body.append(listView);

    const listItemElements = getAllByTestId(document.body, TEST_ID);

    expect(listItemElements).toHaveLength(listItemText.length);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const elementCollection = listView.collect();
  });

  test("should render a static view with multiple attributes", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const ref = "image";
    const imageData = {
      img: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1789&q=80",
      imgAlt: "this is an alt tag",
      style: "max-width:500px;",
    };

    const element = html`
      <img
        data-testid="${TEST_ID}"
        style="${imageData.style}"
        src="${imageData.img}"
        alt="${imageData.imgAlt}"
      />
    `;
    document.body.append(element);

    const imageElement = getByTestId(document.body, TEST_ID);

    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute("src", imageData.img);
    expect(imageElement).toHaveAttribute("alt", imageData.imgAlt);
    expect(imageElement).toHaveAttribute("style", imageData.style);
    expect(imageElement).not.toHaveAttribute("style", imageData.img);
  });

  test("should defend against basic XSS attacks", async () => {
    const safeId = "safe-image";
    const dangerousId = "dangerous-image";
    const imageData = {
      img: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1789&q=80",
      imgAlt: "this is an alt tag",
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const safeImageSafe = true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const dangerousImageSafe = true;

    const errorHandler = jest.fn();
    // @ts-expect-error Testing window property assignment for XSS testing
    window.errorHandler = errorHandler;

    // Modify image src to inject malicious code
    imageData.img = '" onerror="window.errorHandler()" ';

    // Create the safe view
    const safeView = html`
      <img
        data-testid="${safeId}"
        src="${imageData.img}"
        alt="${imageData.imgAlt}"
      />
    `;

    // Create the dangerous view
    const dangerousView = document.createElement("div");
    const dangerousTemplate = `
    <img
      data-testid="${dangerousId}"
      src="${imageData.img}"
      alt="${imageData.imgAlt}"
    />`;
    dangerousView.innerHTML = dangerousTemplate;

    // Append both elements to the dom
    document.body.append(safeView, dangerousView.firstElementChild!);

    const safeElement = getByTestId(document.body, safeId);
    const attackedElement = getByTestId(document.body, dangerousId);

    expect(safeElement).toHaveAttribute("src", imageData.img);
    expect(attackedElement).not.toHaveAttribute("src", imageData.img);

    expect(safeElement).not.toHaveAttribute("onerror");
    expect(attackedElement).toHaveAttribute("onerror");

    // If we have an error event, we need to manually trigger it in the Jest environment
    fireEvent.error(attackedElement);
    expect(errorHandler).toBeCalledTimes(1);

    // @ts-expect-error Testing window property cleanup after XSS testing
    window.errorHandler && delete window.errorHandler;
  });

  test("should collect all elements with a ref attribute", () => {
    const generateChildEl = (index = 0, ref = "") =>
      html`<p ref="${ref}" data-testid="generatedEl">
        Element ${index}
      </p>`;

    const sectionView = html`
      <section ref="section" data-testid="${TEST_ID}">
        <h1 ref="title">Title</h1>
        <p ref="content">Content with string: ${"test"}</p>
        <p ref="number">${90210}</p>
        <ul>
          ${["Item 1", "Item 2"].map((item, index) =>
            generateChildEl(index, `array-${index}`)
          )}
        </ul>
        ${generateChildEl(0, "child")}
        ${[
          generateChildEl(1, "childArray-0"),
          generateChildEl(2, "childArray-1"),
        ]}
      </section>
    `;

    document.body.append(sectionView);

    const elementCollection = sectionView.collect();
    expect(getByTestId(document.body, TEST_ID)).toBeInTheDocument();

    // Verify all refs are collected
    const expectedRefs = [
      "section",
      "title",
      "content",
      "number",
      "array-0",
      "array-1",
      "child",
      "childArray-0",
      "childArray-1",
    ];

    expectedRefs.forEach(ref => {
      expect(elementCollection).toHaveProperty(ref);
      expect(elementCollection[ref]).toBeInTheDocument();
    });
  });
});
