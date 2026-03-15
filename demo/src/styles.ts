import { css } from "@emotion/css";

// Mondrian palette
const black = "#111111";
const white = "#FAFAF8";
const red = "#D62626";
const blue = "#1A3FAA";
const yellow = "#F7C518";
const pageBackground = "#F0EBE0";

export const theme = {
  highlight: black,
  background: pageBackground,
  red,
  blue,
  yellow,
  white,
};

export const layoutStyles = css`
  * {
    color: ${black};
  }
  .layout,
  &.layout {
    margin-bottom: 50px;
    &__headingContainer {
      align-items: stretch;
      border: 3px solid ${black};
      display: flex;
      margin-bottom: 40px;
      max-width: 640px;
    }
    &__headingAccent {
      background: ${blue};
      border-right: 3px solid ${black};
      flex-shrink: 0;
      width: 20px;
    }
    &__headingContent {
      padding: 24px 28px;
    }
  }
  h1 {
    font-size: 2.5rem;
    font-weight: 900;
    letter-spacing: -2px;
    line-height: 1;
    margin: 0 0 12px;
    text-transform: lowercase;
  }
  p {
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.01em;
    line-height: 1.6;
    margin: 0;
    max-width: 52ch;
    opacity: 0.8;
  }
`;

export const footerStyles = css`
  align-items: center;
  background: ${pageBackground};
  border-top: 3px solid ${black};
  display: flex;
  gap: 16px;
  height: 80px;
  padding: 0 8px;
  width: 100%;
  button {
    background: ${white};
    border: 3px solid ${black};
    border-radius: 0;
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 900;
    outline: none;
    padding: 0.4em 0.7em;
    box-shadow: 4px 4px 0 ${black};
    transition:
      box-shadow 0.08s ease-out,
      transform 0.08s ease-out;
    &:hover,
    &:focus {
      box-shadow: 2px 2px 0 ${black};
      transform: translate(2px, 2px);
    }
    &:active {
      box-shadow: 0 0 0 ${black};
      transform: translate(4px, 4px);
    }
  }
`;

export const productStyles = css`
  &.product {
    align-items: stretch;
    background: ${white};
    border: 3px solid ${black};
    box-shadow: 6px 6px 0 ${black};
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    padding: 0;
    width: 100%;
    * {
      color: ${black};
      font-size: 20px;
      text-align: left;
    }
    > *:not(:last-child) {
      margin-bottom: 0;
    }
  }
  .product {
    &__imageContainer {
      background: linear-gradient(
        to bottom,
        var(--card-accent, ${black}) 0%,
        ${pageBackground} 100%
      );
      border-bottom: 3px solid ${black};
      height: 32vmin;
      width: 100%;
    }

    &__image {
      display: none;
    }

    &__headingContainer {
      flex: 1;
      min-height: 13vmin;
      padding: 16px 26px; /* φ-progression: 10→16→26 */
      border-bottom: 3px solid ${black};
    }

    &__metaRow {
      border-bottom: 3px solid ${black};
      display: flex;
      width: 100%;
    }

    &__likesContainer {
      flex: 1.618; /* golden majority — action zone */
    }

    &__cartContainer {
      width: 100%;
    }

    &__likeBtn {
      align-items: center;
      background: ${white};
      border: none;
      cursor: pointer;
      display: flex;
      font-size: 1em;
      font-weight: 700;
      height: 100%;
      justify-content: center;
      outline: none;
      padding: 16px 10px; /* 16:10 ≈ φ vertical:horizontal */
      width: 100%;
      transition:
        background 0.08s,
        color 0.08s;
      &:hover {
        background: ${red};
        color: ${white};
      }
    }

    &__thumbsUp {
      display: flex;
      cursor: pointer;
      margin-right: 10px;
      svg {
        fill: currentColor;
        max-width: 26px;
        min-width: 16px; /* 16:26 ≈ 1:φ */
      }
    }

    &__name {
      font-size: 1.375em; /* 0.85 × φ ≈ 1.375 */
      font-weight: 900;
      margin: 0 0 10px;
      letter-spacing: -0.5px;
    }

    &__description {
      font-size: 0.85em;
      font-weight: 400;
      margin: 0;
      opacity: 0.75;
    }

    &__priceContainer {
      flex: 1; /* minor portion: ~38.2% */
      background: ${black};
      border-right: 3px solid ${black};
      display: flex;
      align-items: center;
      padding: 10px 16px; /* 10:16 ≈ 1:φ */
    }
    &__price {
      color: ${yellow} !important;
      font-size: 1.25em;
      font-weight: 900;
      text-decoration: none;
      width: 100%;
      margin: 0;
    }

    &__cartContainer {
      button {
        background: ${blue};
        border: none;
        border-top: 3px solid ${black};
        color: ${white} !important;
        cursor: pointer;
        font-size: 1em;
        font-weight: 700;
        padding: 14px 20px;
        text-align: left;
        transition: background 0.08s;
        width: 100%;
        &:hover {
          background: ${black};
        }
      }
    }

    /* Status modifiers */
    &--sold-out {
      .product__image {
        filter: grayscale(100%);
        opacity: 0.6;
      }
      .product__likeBtn--disabled {
        background: #ccc;
        color: #666 !important;
        cursor: not-allowed;
        font-style: italic;
        letter-spacing: 1px;
      }
      .product__cartContainer button {
        background: #999;
        cursor: not-allowed;
        &:hover {
          background: #999;
        }
      }
    }

    &--clearance {
      .product__price {
        text-decoration: line-through;
        opacity: 0.7;
      }
      .product__priceContainer::after {
        content: "SALE";
        color: ${yellow};
        font-size: 0.65em;
        font-weight: 900;
        letter-spacing: 2px;
        margin-left: 8px;
      }
    }

    &--featured {
      .product__headingContainer::before {
        content: "FEATURED";
        display: block;
        font-size: 0.65em;
        font-weight: 900;
        letter-spacing: 3px;
        color: ${red};
        margin-bottom: 6px;
      }
    }
  }
`;

export const productGridStyles = css`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-flow: row dense;
  gap: 30px;
  margin: 0 auto;
  width: 100%;

  /* Default: 2-col span (3 per row) — accent cycles through primary palette */
  & > .product {
    grid-column: span 2;
  }
  & > .product:nth-child(4n + 1) {
    --card-accent: ${blue};
  }
  & > .product:nth-child(4n + 2) {
    --card-accent: ${red};
  }
  & > .product:nth-child(4n + 3) {
    --card-accent: ${yellow};
  }
  & > .product:nth-child(4n + 4) {
    --card-accent: ${black};
  }

  /* Featured: wide, red — high demand */
  & > .product--featured {
    grid-column: span 4;
    --card-accent: ${red};
  }

  /* Clearance: wide, yellow — urgency */
  & > .product--clearance {
    grid-column: span 4;
    --card-accent: ${yellow};
  }

  /* Sold-out: narrow, demoted */
  & > .product--sold-out {
    grid-column: span 2;
    --card-accent: ${black};
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    & > .product,
    & > .product--featured,
    & > .product--clearance,
    & > .product--sold-out {
      grid-column: span 1;
    }
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    & > .product,
    & > .product--featured,
    & > .product--clearance,
    & > .product--sold-out {
      grid-column: span 1;
    }
  }
`;

export const cartStyles = css`
  &.cart {
    background: ${white};
    border-left: 3px solid ${black};
    height: 100vh;
    max-width: 100vw;
    min-width: 320px;
    position: fixed;
    right: 0;
    top: 0;
    transition: transform 0.2s ease-out;

    &--open {
      transform: translateX(0);
    }
    &--closed {
      transform: translateX(100%);
    }
  }

  .cart__contentContainer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  /* overflow: visible lets the button peek left outside the panel edge */
  .cart__controlContainer {
    background: ${black};
    overflow: visible;
    width: 100%;
  }

  .cart__control {
    background: ${black};
    border: none;
    cursor: pointer;
    display: block;
    outline: none;
    padding: 12px 15px;
    transition:
      transform 0.2s ease-out,
      background 0.1s ease-out;
    /* fit-content ensures -100% = the button's own width, not the container's */
    width: fit-content;
    svg {
      display: block;
      fill: ${white};
      width: 44px;
    }
    &:hover,
    &:focus {
      background: ${red};
    }
  }

  /* Slide the button left by its own width so it peeks out from the panel edge */
  .cart__control--closed {
    transform: translateX(-100%);
  }
  .cart__control--open {
    transform: translateX(0);
  }

  .cart__items {
    flex: 1;
    overflow-y: auto;
  }

  .cart__recentlyAdded {
    background: ${yellow};
    border-top: 3px solid ${black};
    font-size: 0.8em;
    font-weight: 700;
    margin: 0;
    padding: 8px 15px;
  }

  .cart__total {
    background: ${red};
    border-top: 3px solid ${black};
    color: ${white} !important;
    display: block;
    font-size: 18px;
    font-weight: 900;
    padding: 15px;
  }

  .cart__sum {
    color: ${white} !important;
    font-weight: 900;
  }
`;
export const cartItemStyles = css`
  &.item,
  .item {
    border-bottom: 3px solid ${black};
    display: flex;
    font-size: 16px;
    list-style: none;
    margin: 0;
    padding: 14px 15px;
    &__details {
      flex-grow: 1;
    }
    &__imageContainer {
      border: 3px solid ${black};
      display: inline-block;
      flex-shrink: 0;
      height: 15vmin;
      margin-right: 12px;
      max-height: 100px;
      max-width: 100px;
      width: 15vmin;
    }

    &__image {
      display: block;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }

    &__nameContainer {
      font-weight: 700;
      width: 100%;
    }

    &__priceContainer {
      font-size: 0.9em;
      width: 100%;
    }

    &__quantityContainer {
      align-items: center;
      display: flex;
      justify-content: space-between;
      margin: 5px 0;
      width: 100%;
    }

    &__quantity {
      background: transparent;
      border: none;
      color: ${black};
      font-size: 16px;
      font-weight: 900;
    }
    &__btn {
      background: ${black};
      border: none;
      color: ${white};
      cursor: pointer;
      font-weight: 700;
      min-width: 28px;
      padding: 4px 8px;
      transition: background 0.08s;
      &:hover {
        background: ${red};
      }
    }
  }
`;

export const formStyles = css`
  .form {
    display: flex;
    flex-direction: column;
    position: relative;
    &__disclaimer {
      font-size: 0.75em;
      font-weight: 400;
      margin: 2em 0 0;
      text-align: right;
    }
    &__label {
      align-items: center;
      display: flex;
      font-size: 1.1rem;
      font-weight: 900;
      flex-shrink: 0;
      letter-spacing: 1px;
      margin-top: 0;
      padding-right: 50px;
      position: relative;
      text-transform: uppercase;
      white-space: nowrap;
      &:after {
        background: ${black};
        content: "";
        flex-grow: 1;
        height: 3px;
        margin-left: 16px;
        position: relative;
        width: auto;
      }
    }
  }
  .formInput {
    align-items: center;
    color: ${black};
    display: flex;
    margin-bottom: 10px;
    padding: 10px 0;
    &__input {
      background: ${white};
      border: 3px solid ${black};
      flex-grow: 1;
      font-size: 1rem;
      font-weight: 500;
      margin-left: 10px;
      outline: none;
      padding: 8px 12px;
      &::placeholder {
        color: #888;
      }
      &:focus {
        outline: 3px solid ${blue};
        outline-offset: 1px;
      }
    }
  }
  button[type="submit"] {
    align-self: flex-end;
    background: ${black};
    border: 3px solid ${black};
    box-shadow: 4px 4px 0 ${red};
    color: ${white};
    cursor: pointer;
    font-family: inherit;
    font-size: 1rem;
    font-weight: 900;
    letter-spacing: 1px;
    margin-top: 25px;
    min-width: 33%;
    padding: 12px 24px;
    text-transform: uppercase;
    transition:
      box-shadow 0.08s ease-out,
      transform 0.08s ease-out;
    &:hover {
      box-shadow: 2px 2px 0 ${red};
      transform: translate(2px, 2px);
    }
    &:active {
      box-shadow: 0 0 0 ${red};
      transform: translate(4px, 4px);
    }
  }
`;

export const modalStyles = css`
  &.modal,
  .modal {
    align-items: center;
    background: rgba(17, 17, 17, 0.8);
    display: flex;
    flex-direction: column;
    inset: 0;
    justify-content: center;
    position: fixed;
    transition: opacity 0.12s ease-out;
    &__open {
      &--true {
        opacity: 1;
      }
      &--false {
        opacity: 0;
        pointer-events: none;
      }
    }
    &__content {
      background: ${white};
      border: 3px solid ${black};
      border-top: 8px solid ${blue};
      box-shadow: 8px 8px 0 ${black};
      max-width: 750px;
      padding: 40px;
      position: relative;
      width: 50vw;
    }
    &__close {
      align-items: center;
      background: ${black};
      border: 3px solid ${black} !important;
      border-radius: 0 !important;
      color: ${white};
      cursor: pointer;
      display: flex;
      font-size: 1.25rem;
      font-weight: 900;
      height: 36px;
      justify-content: center;
      padding: 0 !important;
      position: absolute;
      right: 16px;
      top: 16px;
      transition: background 0.08s;
      width: 36px;
      &:hover {
        background: ${red};
      }
    }
  }
`;
