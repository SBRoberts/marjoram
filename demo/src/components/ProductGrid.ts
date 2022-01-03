import { html } from "../../../src";
import { Product } from "./Product";
import { productGridStyles } from "../styles";
import { productsType } from "../data";

export const ProductGrid = (products: productsType) => {
  const element = html`
    <div class="productGrid ${productGridStyles}">${products.map(Product)}</div>
  `;

  return element;
};
