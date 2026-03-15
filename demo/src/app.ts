// Modules
import globalStyles from "./globalStyles";

// Components
import { ProductGrid } from "./components/ProductGrid";
import { CartWidget } from "./components/Cart";
import { ChatLauncher } from "./components/ChatLauncher";
import { CookieBanner } from "./components/CookieBanner";
import { NotificationBell } from "./components/NotificationBell";
import { ContactWidget } from "./components/Modal";
import { JumpWidget } from "./components/JumpLink";
import { Layout } from "./components/Layout";

// Mock Data
import { cart, products } from "./data";
import { createWidget } from "../../src";

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Standalone widgets — each mounts into its own root,
  // independent of the page layout, managing its own lifecycle.
  const cartWidget = CartWidget(cart.items);
  const chatWidget = ChatLauncher();
  const cookieWidget = CookieBanner();
  const bellWidget = NotificationBell();
  const contactWidget = ContactWidget();
  const jumpWidget = JumpWidget();

  // Main page widget wraps the product grid and layout chrome.
  const appWidget = createWidget({
    target: "#root",
    model: {},
    render: () => Layout(ProductGrid(products)),
    onMount: () => {
      cartWidget.mount();
      chatWidget.mount();
      cookieWidget.mount();
      bellWidget.mount();
      contactWidget.mount();
      jumpWidget.mount();
    },
    onDestroy: () => {
      cartWidget.destroy();
      chatWidget.destroy();
      cookieWidget.destroy();
      bellWidget.destroy();
      contactWidget.destroy();
      jumpWidget.destroy();
    },
  });

  appWidget.mount();
});

// Apply global styles
globalStyles;
