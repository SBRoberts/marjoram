// Modules
import globalStyles from "./globalStyles";

// Components
import { ProductGrid } from "./components/ProductGrid";
import { Cart } from "./components/Cart";

// Mock Data
import { cart, products } from "./data";
import { View, html, useViewModel } from "../../src";
import { Layout } from "./components/Layout";

const init = () => {
  // Find the app's root element
  const appRoot = document.getElementById("root");

  // Construct views
  const CartElement = Cart(cart.items);
  const ProductGridElement = ProductGrid(products);
  const Page = Layout(CartElement, ProductGridElement);

  // Append views to DOM
  appRoot.append(Page);
};

document.addEventListener("DOMContentLoaded", init);
globalStyles;
