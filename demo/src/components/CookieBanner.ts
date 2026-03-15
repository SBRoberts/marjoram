import { createWidget, html } from "../../../src";
import { Widget } from "../../../src/widget/createWidget";

const styles = `
  *:focus-visible { outline: 3px solid #1A3FAA; outline-offset: 2px; }
  .banner {
    position: fixed;
    bottom: 1.5rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9000;
    background: #111111;
    border: 3px solid #111111;
    box-shadow: 4px 4px 0 #111111;
    color: #FAFAF8;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0.75rem 0.6rem 1rem;
    white-space: nowrap;
  }
  .banner__text { font-weight: 500; letter-spacing: 0.01em; }
  .banner__actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
  .banner__btn {
    padding: 0.35rem 0.75rem;
    border: 2px solid #FAFAF8;
    border-radius: 0;
    font-size: 0.75rem;
    font-weight: 900;
    cursor: pointer;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: box-shadow 0.08s, transform 0.08s;
  }
  .banner__btn:hover { box-shadow: 2px 2px 0 #FAFAF8; transform: translate(-1px, -1px); }
  .banner__btn--accept { background: #F7C518; color: #111111; border-color: #F7C518; }
  .banner__btn--accept:hover { box-shadow: 2px 2px 0 #F7C518; }
  .banner__btn--reject { background: transparent; color: #FAFAF8; }
`;

export const CookieBanner = (): Widget<{ visible: boolean }> => {
  let cleanupListeners: (() => void) | undefined;

  const widget = createWidget({
    target: "#cookie-root",
    shadow: "open",
    styles,
    model: {
      visible: true,
    },
    render: vm => html`
      <div
        class="banner"
        role="region"
        aria-label="Cookie consent"
        style="display: ${vm.$visible.compute((v: boolean) =>
          v ? "flex" : "none"
        )}"
      >
        <div class="banner__text" id="cookie-desc">Cookies — demo only.</div>
        <div
          class="banner__actions"
          role="group"
          aria-label="Cookie consent options"
        >
          <button
            class="banner__btn banner__btn--reject"
            aria-describedby="cookie-desc"
            onclick=${() => {
              vm.visible = false;
            }}
          >
            No thanks
          </button>
          <button
            class="banner__btn banner__btn--accept"
            aria-describedby="cookie-desc"
            onclick=${() => {
              vm.visible = false;
            }}
          >
            Sure, why not
          </button>
        </div>
      </div>
    `,
    onMount: vm => {
      const host = document.getElementById("cookie-root")!;

      // Focus the first action button so keyboard users immediately know about the banner
      queueMicrotask(() => {
        host.shadowRoot
          ?.querySelector<HTMLButtonElement>(".banner__btn--reject")
          ?.focus();
      });

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && vm.visible) {
          vm.visible = false;
        }
      };

      document.addEventListener("keydown", onKeyDown);
      cleanupListeners = () =>
        document.removeEventListener("keydown", onKeyDown);
    },
    onDestroy: () => cleanupListeners?.(),
  });

  return widget;
};
