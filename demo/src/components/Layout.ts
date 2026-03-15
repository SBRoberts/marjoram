import { html, View } from "../../../src";
import { layoutStyles } from "../styles";

export const Layout = (...children: View[]) => {
  const view = html`
    <div class="${layoutStyles} layout">
      <div class="layout__headingContainer">
        <div class="layout__headingAccent"></div>
        <div class="layout__headingContent">
          <h1>marjoram</h1>
          <p>
            Zero-dependency widget SDK — reactive views, shadow DOM isolation,
            no framework required.
          </p>
        </div>
      </div>
      ${children}
    </div>
  `;
  return view;
};
