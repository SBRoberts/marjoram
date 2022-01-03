import { useViewModel, html, View } from "../../../src";
import { footerStyles, layoutStyles } from "../styles";
import { ContactForm } from "./ContactForm";
import { JumpLink } from "./JumpLink";
import { Modal } from "./Modal";

export const Layout = (...children: View[]) => {
  const view = html`
    <div class="${layoutStyles} layout">
      <div class="layout__headingContainer">
        <marquee behavior="alternate">
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
          <h1>Welcome to <em>Store™️</em></h1>
        </marquee>
        <p>
          Pickled intelligentsia butcher palo santo. Brooklyn narwhal small
          batch, hoodie echo park chia tofu. Fingerstache celiac bicycle rights,
          poke plaid locavore roof party neutra cronut. Hella cloud bread shabby
          chic, you probably haven't heard of them cornhole pok pok pop-up wolf
          neutra 90's drinking vinegar
        </p>
      </div>
      ${children}
    </div>
    <footer class="${layoutStyles} ${footerStyles}">
      ${Modal({ openBtn: "💌", content: ContactForm() })}
      ${JumpLink({ text: "⬆️", target: document.firstElementChild })}
    </footer>
  `;
  return view;
};
