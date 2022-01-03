import { html, useViewModel } from "../../../src";
import { cartStyles } from "../styles";
import { CartItem } from "./CartItem";
import { CartIcon } from "./Icons";
import { cart, productsType } from "../data";
import { SchemaProp } from "../../../src/schema";

const deriveCartTotal = (items: typeof cart.items) =>
  items.reduce((total, cartItem) => {
    if (cartItem.price) {
      total += cartItem.price * cartItem.quantity;
    }
    return total;
  }, 0);

export const Cart = (items: productsType) => {
  // Initialize state
  const state = useViewModel({
    items,
    isOpen: false,
    total: deriveCartTotal(cart.getAll()),
  });

  // Destructure keys for ease of use
  const { $isOpen, $items, $total } = state;

  // Compute callbacks
  const openState = $isOpen.compute((isOpen) => (isOpen ? "open" : "closed"));
  const computedCartItems = $items.compute((items) => items.map(CartItem));

  // Construct the view
  const element = html`
    <div ref="cartContainer" class="${cartStyles} cart cart--${openState}">
      <div class="cart__contentContainer">
        <div class="cart__controlContainer">
          <button
            ref="cartBtn"
            class="cart__control cart__control--${openState}"
          >
            ${CartIcon()}
          </button>
        </div>
        <ul class="cart__items">
          ${computedCartItems}
        </ul>
        <div class="cart__total">
          Total: <span class="cart__sum">$${$total}</span>
        </div>
      </div>
    </div>
  `;

  // Collect any refs
  const { cartBtn } = element.collect();

  // Handle cart open/close
  cartBtn.addEventListener("click", () => {
    state.isOpen = !state.isOpen;
  });

  // Subscribe to any cart changes – this implementation has nothing to do with the ViewView library
  cart.subscribe((newItems) => {
    state.items = newItems;
    state.total = deriveCartTotal(newItems);
  });

  return element;
};
