import { html, useViewModel, when } from "../../../src";
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
    recentlyAdded: [] as string[],
  });

  // Destructure keys for ease of use
  const { $isOpen, $items, $total, $recentlyAdded } = state;

  // Compute callbacks
  const openState = $isOpen.compute(isOpen => (isOpen ? "open" : "closed"));
  const computedCartItems = $items.compute(items => items.map(CartItem));
  const hasRecentlyAdded = $recentlyAdded.compute(
    (items: string[]) => items.length > 0
  );
  const lastAdded = $recentlyAdded.compute(
    (items: string[]) => items[items.length - 1] ?? ""
  );

  // Construct the view
  const element = html`
    <div ref="cartContainer" class="${cartStyles} cart cart--${openState}">
      <div class="cart__contentContainer">
        <div class="cart__controlContainer">
          <button
            onclick=${() => {
              state.isOpen = !state.isOpen;
            }}
            class="cart__control cart__control--${openState}"
          >
            ${CartIcon()}
          </button>
        </div>
        <ul class="cart__items">
          ${computedCartItems}
        </ul>
        ${when(
          hasRecentlyAdded,
          () => html`
            <p class="cart__recentlyAdded">Last added: ${lastAdded}</p>
          `
        )}
        <div class="cart__total">
          Total: <span class="cart__sum">$${$total}</span>
        </div>
      </div>
    </div>
  `;

  // Subscribe to cart changes; push new item names rather than replacing the full array
  cart.subscribe(newItems => {
    const prevIds = new Set((state.items as typeof newItems).map(i => i.id));
    const added = newItems.filter(
      item => !prevIds.has(item.id) && item.quantity > 0
    );
    // Array mutation demo: push each newly-added item name onto the reactive array
    added.forEach(item => state.recentlyAdded.push(item.name));

    state.items = newItems;
    state.total = deriveCartTotal(newItems);
  });

  return element;
};
