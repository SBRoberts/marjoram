import { html, useViewModel } from "../../../src";
import { productStyles } from "../styles";
import { ThumbsUp } from "./Icons";
import { cart, productType } from "../data";

export const Product = (product: productType) => {
  const state = useViewModel(product);

  const { $image, $name, $price, $likes, $description } = state;

  const modifier = product.featured
    ? " product--featured"
    : product.clearance
      ? " product--clearance"
      : product.soldOut
        ? " product--sold-out"
        : "";

  const cartButton = product.soldOut
    ? html`<button disabled class="product__likeBtn product__likeBtn--disabled">
        Sold Out
      </button>`
    : html`<button
        onclick=${() => cart.addItem(product.id)}
        class="product__likeBtn"
      >
        Add To Cart
      </button>`;

  const element = html`
    <div class="${productStyles} product${modifier}">
      <div class="product__imageContainer">
        <img class="product__image" src="${$image}" alt="${$name}" />
      </div>
      <div class="product__headingContainer">
        <h3 class="product__name">${$name}</h3>
        <p class="product__description">${$description}</p>
      </div>
      <div class="product__metaRow">
        <div class="product__priceContainer">
          <h4 class="product__price">$${$price}</h4>
        </div>
        <div class="product__likesContainer">
          <button onclick=${() => (state.likes += 1)} class="product__likeBtn">
            <span class="product__thumbsUp"> ${ThumbsUp()} </span>
            <span>${$likes}</span>
          </button>
        </div>
      </div>

      <div class="product__cartContainer">${cartButton}</div>
    </div>
  `;

  return element;
};
