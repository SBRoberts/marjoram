import { html } from "../../src";
import { getByTestId } from "@testing-library/dom";

const TEST_ID = "security-test";

describe("Security & XSS Prevention", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    // Clean up any global handlers
    if ((window as any).xssHandler) {
      delete (window as any).xssHandler;
    }
  });

  describe("Script Injection Prevention", () => {
    test("should prevent script injection in text content", () => {
      const maliciousScript =
        "<script>window.xssHandler = () => 'XSS';</script>";
      const view = html`<div data-testid="${TEST_ID}">${maliciousScript}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(maliciousScript);
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should prevent script injection in attributes", () => {
      const maliciousAttr = 'value" onload="window.xssHandler = true" other="';
      const view = html`<input
        data-testid="${TEST_ID}"
        value="${maliciousAttr}"
      />`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID) as HTMLInputElement;
      expect(element.value).toBe(maliciousAttr);
      expect(element.hasAttribute("onload")).toBe(false);
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should prevent inline event handlers", () => {
      const maliciousHandler = "javascript:window.xssHandler = true";
      const view = html`<a data-testid="${TEST_ID}" href="${maliciousHandler}"
        >Link</a
      >`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID) as HTMLAnchorElement;
      expect(element.href).toContain(maliciousHandler);

      // Click should not execute the javascript
      element.click();
      expect((window as any).xssHandler).toBeUndefined();
    });
  });

  describe("Data URL Prevention", () => {
    test("should handle data URLs safely", () => {
      const dataUrl =
        "data:text/html,<script>window.xssHandler = true</script>";
      const view = html`<iframe
        data-testid="${TEST_ID}"
        src="${dataUrl}"
      ></iframe>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID) as HTMLIFrameElement;
      expect(element.src).toBe(dataUrl);

      // The script in data URL should not execute in our context
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should handle malicious data URLs in images", () => {
      const maliciousData =
        'data:image/svg+xml,<svg onload="window.xssHandler = true"><script>window.xssHandler = true</script></svg>';
      const view = html`<img
        data-testid="${TEST_ID}"
        src="${maliciousData}"
        alt="test"
      />`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID) as HTMLImageElement;
      expect(element.src).toBe(maliciousData);
      expect((window as any).xssHandler).toBeUndefined();
    });
  });

  describe("HTML Entity Handling", () => {
    test("should properly escape HTML entities", () => {
      const htmlEntities = "&lt;script&gt;alert('xss')&lt;/script&gt;";
      const view = html`<div data-testid="${TEST_ID}">${htmlEntities}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(htmlEntities);
      expect(element.innerHTML).toContain("&amp;lt;");
    });

    test("should handle mixed HTML entities and regular text", () => {
      const mixed = "Normal text &amp; special chars &lt;tag&gt;";
      const view = html`<div data-testid="${TEST_ID}">${mixed}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(mixed);
    });
  });

  describe("Attribute Injection Prevention", () => {
    test("should prevent attribute injection via quotes", () => {
      const maliciousValue =
        'normal" onclick="window.xssHandler = true" data-evil="';
      const view = html`<button
        data-testid="${TEST_ID}"
        data-value="${maliciousValue}"
      >
        Button
      </button>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.getAttribute("data-value")).toBe(maliciousValue);
      expect(element.hasAttribute("onclick")).toBe(false);
      expect(element.hasAttribute("data-evil")).toBe(false);
    });

    test("should prevent style injection", () => {
      const maliciousStyle =
        'color: red; background: url("javascript:window.xssHandler = true")';
      const view = html`<div data-testid="${TEST_ID}" style="${maliciousStyle}">
        Content
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.getAttribute("style")).toBe(maliciousStyle);
      expect((window as any).xssHandler).toBeUndefined();
    });
  });

  describe("URL Scheme Prevention", () => {
    test("should handle javascript: URLs safely", () => {
      const jsUrl = "javascript:window.xssHandler = true; void(0);";
      const view = html`<a data-testid="${TEST_ID}" href="${jsUrl}"
        >Malicious Link</a
      >`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID) as HTMLAnchorElement;
      expect(element.href).toContain("javascript:");

      // Should not execute when clicked in test environment
      element.click();
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should handle vbscript: URLs safely", () => {
      const vbUrl = "vbscript:window.xssHandler = true";
      const view = html`<a data-testid="${TEST_ID}" href="${vbUrl}"
        >VB Link</a
      >`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID) as HTMLAnchorElement;
      expect(element.href).toContain("vbscript:");
      expect((window as any).xssHandler).toBeUndefined();
    });
  });

  describe("SVG Injection Prevention", () => {
    test("should handle SVG with script tags safely", () => {
      const svgWithScript =
        "<svg><script>window.xssHandler = true</script></svg>";
      const view = html`<div data-testid="${TEST_ID}">${svgWithScript}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(svgWithScript);
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should handle SVG with event handlers safely", () => {
      const svgWithHandler =
        '<svg onload="window.xssHandler = true"><circle r="10"/></svg>';
      const view = html`<div data-testid="${TEST_ID}">${svgWithHandler}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(svgWithHandler);
      expect((window as any).xssHandler).toBeUndefined();
    });
  });

  describe("Form Input Sanitization", () => {
    test("should handle malicious form input values", () => {
      const maliciousInput = "<script>window.xssHandler = true</script>";
      const view = html`<input
        data-testid="${TEST_ID}"
        value="${maliciousInput}"
        type="text"
      />`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID) as HTMLInputElement;
      expect(element.value).toBe(maliciousInput);
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should handle malicious textarea content", () => {
      const maliciousText =
        "</textarea><script>window.xssHandler = true</script><textarea>";
      const view = html`<textarea data-testid="${TEST_ID}">
${maliciousText}</textarea
      >`;
      document.body.append(view);

      const element = getByTestId(
        document.body,
        TEST_ID
      ) as HTMLTextAreaElement;
      expect(element.textContent).toBe(maliciousText);
      expect((window as any).xssHandler).toBeUndefined();
    });
  });

  describe("Complex XSS Vectors", () => {
    test("should handle encoded script injections", () => {
      const encoded = "&lt;script&gt;window.xssHandler = true&lt;/script&gt;";
      const view = html`<div data-testid="${TEST_ID}">${encoded}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(encoded);
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should handle mixed encoding attacks", () => {
      const mixed =
        "normal&lt;script&gt;window.xssHandler = true&lt;/script&gt;normal";
      const view = html`<div data-testid="${TEST_ID}">${mixed}</div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.textContent).toBe(mixed);
      expect((window as any).xssHandler).toBeUndefined();
    });

    test("should handle CSS expression injections", () => {
      const cssExpr = "width: expression(window.xssHandler = true)";
      const view = html`<div data-testid="${TEST_ID}" style="${cssExpr}">
        Content
      </div>`;
      document.body.append(view);

      const element = getByTestId(document.body, TEST_ID);
      expect(element.getAttribute("style")).toBe(cssExpr);
      expect((window as any).xssHandler).toBeUndefined();
    });
  });
});
