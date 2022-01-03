import {
  fireEvent,
  getAllByTestId,
  getByTestId,
  waitFor,
} from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";

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
      (item) => html`<li data-testid="${TEST_ID}">${item}</li>`
    )}`;

    const listView = html` <ul ref="${ref}">
      ${listItemViews}
    </ul>`;
    document.body.append(listView);

    const listItemElements = getAllByTestId(document.body, TEST_ID);

    expect(listItemElements).toHaveLength(listItemText.length);

    const elementCollection = listView.collect();
  });

  test("should render a static view with multiple attributes", () => {
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

    let safeImageSafe = true;
    let dangerousImageSafe = true;

    const errorHandler = jest.fn();
    // @ts-ignore
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
    document.body.append(safeView, dangerousView.firstElementChild);

    const safeElement = getByTestId(document.body, safeId);
    const attackedElement = getByTestId(document.body, dangerousId);

    expect(safeElement).toHaveAttribute("src", imageData.img);
    expect(attackedElement).not.toHaveAttribute("src", imageData.img);

    expect(safeElement).not.toHaveAttribute("onerror");
    expect(attackedElement).toHaveAttribute("onerror");

    // If we have an error event, we need to manually trigger it in the Jest environment
    fireEvent.error(attackedElement);
    expect(errorHandler).toBeCalledTimes(1);

    // @ts-ignore
    window.errorHandler && delete window.errorHandler;
  });

  test("should collect all elements with a ref attribute", () => {
    const sectionData = {
      top: "TOP TEXT",
      bottom: "BOTTOM TEXT",
      title: "Title Text",
      heading: "Heading Text",
      number: 90210,
      img: "https://images.unsplash.com/photo-1519638399535-1b036603ac77?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1789&q=80",
      imgAlt: "this is an alt tag",
      body: "I'm baby swag semiotics scenester drinking vinegar franzen lomo. Cornhole man bun hammock mustache slow-carb. Adaptogen keffiyeh 8-bit woke salvia, leggings flannel food truck echo park blog everyday carry hell of.",
    };

    const refs = {
      section: "section",
      title: "title",
      heading: "heading",
      content: "content",
      number: "number",
      image: "image",
    };

    const sectionView = html`
      <section ref="${refs.section}" data-testid="${TEST_ID}">
        ${sectionData.top}
        <h1 ref="${refs.title}">${sectionData.title}</h1>
        <h2 ref="${refs.heading}">${sectionData.heading}</h2>
        <p ref="${refs.content}">${sectionData.body}</p>
        <div>
          <h3 ref="${refs.number}">${sectionData.number}</h3>
          <div>
            <img
              ref="${refs.image}"
              src="${sectionData.img}"
              alt="${sectionData.imgAlt}"
            />
          </div>
        </div>
        ${sectionData.bottom}
      </section>
    `;

    document.body.append(sectionView);

    const elementCollection = sectionView.collect();

    const sectionEl = getByTestId(document.body, TEST_ID);

    // Assert that all of our refs are collected and actually on the DOM
    for (let ref in refs) {
      const el = elementCollection[ref];
      expect(elementCollection).toHaveProperty(ref);
      expect(el).toBeInTheDocument();
    }
  });

  test("should render a variety of argument types", () => {
    const generateChildEl = (index = 0, ref = "") =>
      html`<p ref="${ref}" data-testid="generatedEl">
        This is element number ${index}
      </p>`;

    const data: Record<string, any> = {
      string: "This is a string",
      number: 90210,
      array: ["Array item 1", "Array item 2", "Array item 3"],
      object: { prop: "This is an object value" },
      child: generateChildEl(0, "child"),
      childArray: [
        generateChildEl(1, "childArray-0"),
        generateChildEl(2, "childArray-1"),
        generateChildEl(3, "childArray-2"),
      ],
    };

    const sectionView = html`
      <section data-testid="${TEST_ID}">
        <p ref="string">${data.string}</p>
        <p ref="number">${data.number}</p>
        <p ref="object">${data.object.prop}</p>
        <ul>
          ${data.array.map((item: any, index: number) =>
            generateChildEl(index, `array-${index}`)
          )}
        </ul>
        ${data.child} ${data.childArray}
      </section>
    `;

    document.body.append(sectionView);

    const elementCollection = sectionView.collect();
    const sectionEl = getByTestId(document.body, TEST_ID);

    // Assert that all of our refs are collected and actually on the DOM
    Object.keys(data).forEach((ref) => {
      const prop = data[ref];
      if (Array.isArray(prop)) {
        prop.forEach((item, index) => {
          const derivedRef = `${ref}-${index}`;
          const el = elementCollection[derivedRef];
          expect(elementCollection).toHaveProperty(derivedRef);
          expect(el).toBeInTheDocument();
        });
      } else if (prop) {
        const el = elementCollection[ref];
        expect(elementCollection).toHaveProperty(ref);
        expect(el).toBeInTheDocument();
      }
    });
  });
});
