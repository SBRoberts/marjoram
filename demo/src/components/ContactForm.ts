import { html, useViewModel, View } from "../../../src";
import { formStyles } from "../styles";

interface InputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autocomplete?: boolean;
  [string: string]: boolean | number | string;
}

interface FormSubmitEvent extends SubmitEvent {
  target: HTMLFormElement;
}

const Input = (
  props: InputProps = {
    label: "",
    name: "",
    placeholder: "",
    autocomplete: false,
  }
) =>
  html` <div class="form__item">
    <label ref="${props.label.toLowerCase()}" class="formInput">
      <span class="formInput__labelText"> ${props.label} </span>
      <input
        type="${props?.type ?? "text"}"
        class="formInput__input"
        placeholder="${props?.placeholder ?? ""}"
        autocomplete="${props?.autocomplete ? "on" : "off"}"
        name="${props?.name ?? ""}"
      />
    </label>
  </div>`;

const inputConfig: InputProps[] = [
  { label: "Name:", name: "name" },
  { label: "Email:", name: "email" },
  { label: "Industry:", name: "industry" },
  { label: "Reason for inquiry:", name: "subject" },
];

export const ContactForm = (formProps?: any) => {
  const viewModel = useViewModel({ isOpen: true });
  const { $isOpen } = viewModel;
  const view = html`
    <div class="${formStyles}">
      <h2 id="form_label" class="form__label">Get in touch</h2>
      <form class="form" ref="form">
        ${inputConfig.map(Input)}
        <button ref="submitBtn" type="submit">Submit</button>
      </form>
    </div>
  `;
  const { form } = view.collect();

  form?.addEventListener("submit", (e: FormSubmitEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    /* Submit form data
      fetch("api/some-endpoint", {
        body: formData,
        method: "post",
      }); 
    */
  });
  return view;
};
