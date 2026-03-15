import { html, when, createWidget } from "../../../src";
import { cartStyles } from "../styles";
import { CartItem } from "./CartItem";
import { CartIcon } from "./Icons";
import { cart, productsType } from "../data";

const deriveCartTotal = (items: typeof cart.items) =>
  items.reduce((total, cartItem) => {
    if (cartItem.price) {
      total += cartItem.price * cartItem.quantity;
    }
    return total;
  }, 0);

/**
 * Self-contained cart widget. Mounts into #cart-root independently of the
 * main page layout, demonstrating the embedded widget pattern.
 */
export const CartWidget = (items: productsType) =>
  createWidget({
    target: "#cart-root",
    model: {
      items,
      isOpen: false,
      total: deriveCartTotal(items),
      recentlyAdded: [] as string[],
    },
    render: vm => {
      const openState = vm.$isOpen.compute(isOpen =>
        isOpen ? "open" : "closed"
      );
      const computedCartItems = vm.$items.compute(items => items.map(CartItem));
      const hasRecentlyAdded = vm.$recentlyAdded.compute(
        (items: string[]) => items.length > 0
      );
      const lastAdded = vm.$recentlyAdded.compute(
        (items: string[]) => items[items.length - 1] ?? ""
      );

      return html`
        <div ref="cartContainer" class="${cartStyles} cart cart--${openState}">
          <div class="cart__contentContainer">
            <div class="cart__controlContainer">
              <button
                onclick=${() => {
                  vm.isOpen = !vm.isOpen;
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
              Total: <span class="cart__sum">$${vm.$total}</span>
            </div>
          </div>
        </div>
      `;
    },
    onMount: vm => {
      // Subscribe to cart changes; push new item names onto the reactive array
      cart.subscribe(newItems => {
        const prevIds = new Set((vm.items as typeof newItems).map(i => i.id));
        const added = newItems.filter(
          item => !prevIds.has(item.id) && item.quantity > 0
        );
        added.forEach(item => vm.recentlyAdded.push(item.name));
        vm.items = newItems;
        vm.total = deriveCartTotal(newItems);
      });
    },
  });
