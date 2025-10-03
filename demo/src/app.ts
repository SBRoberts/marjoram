// Modules
import globalStyles from "./globalStyles";

// Components
import { ProductGrid } from "./components/ProductGrid";
import { Cart } from "./components/Cart";

// Mock Data
import { cart, products } from "./data";
import { View, html, useViewModel } from "../../src";
import { Layout } from "./components/Layout";

/**
 * Initialize the demo application
 */
const init = (): void => {
  // Find the app's root element
  const appRoot = document.getElementById("root");

  if (!appRoot) {
    throw new Error("Could not find element with id 'root'");
  }

  // Construct views
  const CartElement = Cart(cart.items);
  const ProductGridElement = ProductGrid(products);
  const Page = Layout(CartElement, ProductGridElement);

  // Append views to DOM
  appRoot.append(Page);
};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", init);

// Apply global styles
globalStyles;
