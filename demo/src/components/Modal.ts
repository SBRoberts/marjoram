import { createWidget, html } from "../../../src";
import { Widget } from "../../../src/widget/createWidget";
import { ContactForm } from "./ContactForm";
import { css } from "@emotion/css";

const black = "#111111";
const white = "#FAFAF8";
const red = "#D62626";
const blue = "#1A3FAA";

const triggerCls = css`
  align-items: center;
  background: ${red};
  border: 3px solid ${black};
  border-radius: 0;
  bottom: calc(1.5rem + 56px + 0.75rem);
  box-shadow: 4px 4px 0 ${black};
  color: ${white};
  cursor: pointer;
  display: flex;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 1rem;
  font-weight: 900;
  height: 56px;
  justify-content: center;
  left: 1.5rem;
  position: fixed;
  transition:
    box-shadow 0.08s,
    transform 0.08s;
  width: 56px;
  z-index: 9100;
  &:hover {
    box-shadow: 2px 2px 0 ${black};
    transform: translate(2px, 2px);
  }
  &:active {
    box-shadow: 0 0 0 ${black};
    transform: translate(4px, 4px);
  }
`;

const overlayCls = css`
  align-items: center;
  background: rgba(17, 17, 17, 0.85);
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  transition: opacity 0.12s ease-out;
  z-index: 9300;
  &--open {
    opacity: 1;
  }
  &--closed {
    opacity: 0;
    pointer-events: none;
  }
`;

const panelCls = css`
  background: ${white};
  border: 3px solid ${black};
  border-top: 8px solid ${blue};
  box-shadow: 8px 8px 0 ${black};
  max-width: 560px;
  padding: 40px;
  position: relative;
  width: 90vw;
`;

const closeCls = css`
  align-items: center;
  background: ${black};
  border: 3px solid ${black} !important;
  border-radius: 0 !important;
  color: ${white};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 1.1rem;
  font-weight: 900;
  height: 36px;
  justify-content: center;
  position: absolute;
  right: 16px;
  top: 16px;
  transition: background 0.08s;
  width: 36px;
  &:hover {
    background: ${red};
  }
`;

export const ContactWidget = (): Widget<{ isOpen: boolean }> => {
  let cleanupListeners: (() => void) | undefined;

  return createWidget({
    target: "#contact-root",
    model: { isOpen: false as boolean },
    render: vm => {
      const openState = vm.$isOpen.compute((o: boolean) =>
        o ? "open" : "closed"
      );

      return html`
        <button
          class="${triggerCls}"
          aria-label="Open contact form"
          aria-haspopup="dialog"
          onclick=${() => {
            vm.isOpen = true;
          }}
        >
          💌
        </button>
        <div
          class="${overlayCls} ${overlayCls}--${openState}"
          role="dialog"
          aria-label="Contact"
          aria-modal="true"
          onclick=${(e: MouseEvent) => {
            if (e.target === e.currentTarget) vm.isOpen = false;
          }}
        >
          <div class="${panelCls}">
            <button
              class="${closeCls}"
              aria-label="Close"
              onclick=${() => {
                vm.isOpen = false;
              }}
            >
              ✕
            </button>
            ${ContactForm()}
          </div>
        </div>
      `;
    },
    onMount: vm => {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && vm.isOpen) {
          vm.isOpen = false;
        }
      };
      document.addEventListener("keydown", onKeyDown);
      cleanupListeners = () =>
        document.removeEventListener("keydown", onKeyDown);
    },
    onDestroy: () => cleanupListeners?.(),
  });
};
