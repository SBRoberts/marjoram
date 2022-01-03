import { html, useViewModel, View } from "../../../src";
import { modalStyles } from "../styles";
import { ContactForm } from "./ContactForm";

const KEY_CODES = Object.freeze({
  BACKSPACE: 8,
  TAB: 9,
  ESCAPE: 27,
});

interface ModalProps {
  openBtn: string;
  content: View;
}

export const Modal = (modalProps?: ModalProps) => {
  const viewModel = useViewModel({ isOpen: false, ...modalProps });
  let isKeyboardNavigating = false;

  const { $isOpen } = viewModel;

  const view = html` <button class="footer__contact" ref="modalBtn">
      ${viewModel.$openBtn}
    </button>
    <div
      ref="modal"
      role="modal"
      id="modal"
      aria-labelledby="modal_label"
      aria-modal="true"
      aria-hidden="${!viewModel.$isOpen}"
      class="${modalStyles} modal modal__open--${$isOpen}"
    >
      <div ref="modalContent" class="modal__content">
        <button ref="closeBtn" class="modal__close">✕</button>
        ${viewModel.$content}
      </div>
    </div>`;

  const { modal, modalBtn, modalContent, submitBtn, closeBtn } = view.collect();

  /* CLICK HANDLERS */

  const toggleOpen = (open = false) => {
    viewModel.isOpen = open;
  };

  // Close when background is clicked
  modal.addEventListener("click", (e: MouseEvent) => {
    isKeyboardNavigating = false;

    if (
      e.target instanceof Node &&
      e.target === modal &&
      !modalContent.contains(e.target)
    ) {
      toggleOpen(false);
    }
  });

  // Open/Close when the modal button is clicked
  modalBtn.addEventListener("click", () => {
    toggleOpen(!viewModel.isOpen);
  });

  // Close when the exit button is clicked within the modal
  closeBtn?.addEventListener("click", () => {
    toggleOpen(false);
  });

  /* KEY UP HANDLERS */

  // Close on escape
  document.addEventListener("keyup", (e: KeyboardEvent) => {
    isKeyboardNavigating = true;
    const key = e.which || e.keyCode;
    if (key === KEY_CODES.ESCAPE && viewModel.isOpen) {
      viewModel.isOpen = false;
      e.stopPropagation();
    }
  });

  /* FOCUS HANDLERS */

  // Cycle through focuable elements on keyboard navigation
  modalContent.addEventListener("focusout", (e) => {
    if (
      isKeyboardNavigating &&
      e.relatedTarget instanceof Node &&
      !modalContent.contains(e.relatedTarget)
    ) {
      closeBtn.focus();
    }
  });

  return view;
};
