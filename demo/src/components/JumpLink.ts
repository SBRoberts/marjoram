import { createWidget, html } from "../../../src";
import { Widget } from "../../../src/widget/createWidget";

const styles = `
  *:focus-visible { outline: 3px solid #FAFAF8; outline-offset: 2px; }
  .jump {
    align-items: center;
    background: #1A3FAA;
    border: 3px solid #111111;
    border-radius: 0;
    box-shadow: 4px 4px 0 #111111;
    color: #FAFAF8;
    cursor: pointer;
    display: flex;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    font-size: 1.25rem;
    font-weight: 900;
    height: 56px;
    justify-content: center;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    bottom: calc(1.5rem + 56px + 0.75rem);
    right: 1.5rem;
    transition: box-shadow 0.08s, transform 0.08s, opacity 0.2s;
    width: 56px;
    z-index: 9100;
  }
  .jump--visible {
    opacity: 1;
    pointer-events: auto;
  }
  .jump:hover { box-shadow: 2px 2px 0 #111111; transform: translate(2px, 2px); }
  .jump:active { box-shadow: 0 0 0 #111111; transform: translate(4px, 4px); }
`;

export const JumpWidget = (): Widget<{ visible: boolean }> => {
  let onScroll: (() => void) | undefined;

  return createWidget({
    target: "#jump-root",
    shadow: "open",
    styles,
    model: { visible: false as boolean },
    render: vm => {
      const visibleClass = vm.$visible.compute((v: boolean) =>
        v ? "jump--visible" : ""
      );
      return html`
        <button
          class="jump ${visibleClass}"
          aria-label="Back to top"
          onclick=${() =>
            document.firstElementChild?.scrollIntoView({ behavior: "smooth" })}
        >
          ↑
        </button>
      `;
    },
    onMount: vm => {
      onScroll = () => {
        vm.visible = window.scrollY > 200;
      };
      window.addEventListener("scroll", onScroll, { passive: true });
    },
    onDestroy: () => {
      if (onScroll) window.removeEventListener("scroll", onScroll);
    },
  });
};
