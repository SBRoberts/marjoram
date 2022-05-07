import { css } from "@emotion/css";

const highlight = "#496b54";
const background = "#aabfb2";
const footerHeight = "100px";
export const theme = { highlight, background };

export const layoutStyles = css`
  * {
    color: ${highlight};
  }
  .layout,
  &.layout {
    margin-bottom: 50px;
    &__headingContainer {
      min-width: 66%;
      max-width: 100%;
      width: 100vmin;
      margin-bottom: 25px;
    }
  }
  h1 {
    margin-top: 0;
    display: inline-block;
    font-size: 2.5rem;
  }
`;

export const footerStyles = css`
  align-items: center;
  display: flex;
  /* justify-content: space-between; */
  height: ${footerHeight};
  width: 100%;
  > button {
    font-size: 30px;
  }
  button {
    background: transparent;
    border: 1px solid ${highlight};
    border-radius: 10px;
    outline: none;
    padding: 0.5em 0.75em;
    transition: color 0.2s ease-out, background 0.2s ease-out,
      transform 0.2s ease-out;
    &:hover,
    &:focus,
    &:active {
      background: ${highlight};
      color: ${background};
    }
    &:active {
      transform: scale(1.1);
    }
    &:not(:last-of-type) {
      margin-right: 25px;
    }
  }
`;

export const productStyles = css`
  &.product {
    align-items: center;
    box-shadow: 0 10px 30px 0px ${highlight + "66"};
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px;
    width: 100%;

    * {
      color: ${highlight};
      font-size: 20px;
      text-align: center;
    }
    > *:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  .product {
    &__imageContainer {
      height: 40vmin;
      width: 100%;
    }

    &__image {
      border-radius: 10px;
      box-shadow: 0 20px 16px -10px ${highlight + "99"};
      height: 100%;
      object-fit: cover;
      width: 100%;
    }

    &__headingContainer {
      min-height: 13vmin;
    }

    &__likesContainer,
    &__cartContainer {
      width: 100%;
    }

    &__likeBtn {
      align-items: center;
      background: none;
      border: 1px solid ${highlight};
      border-radius: 5px;
      cursor: pointer;
      display: flex;
      font-size: 1em;
      justify-content: center;
      outline: none;
      padding: 20px;
      width: 100%;
      min-height: 8vh;
    }

    &__thumbsUp {
      display: flex;
      cursor: pointer;
      margin-right: 10px;
      svg {
        fill: ${highlight};
        max-width: 50px;
        min-width: 25px;
      }
    }

    &__name {
      font-size: 1.5em;
      margin-bottom: 10px;
    }

    &__description {
      font-size: 1em;
    }

    &__priceContainer {
      padding: 5px;
      width: 100%;
    }
    &__price {
      color: ${highlight};
      font-size: 1.25em;
      font-weight: 700;
      text-decoration: underline;
      width: 100%;
      margin: 0;
    }
  }
`;

export const productGridStyles = css`
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  grid-gap: 100px 50px;
  width: 100%;
`;

export const cartStyles = css`
  &.cart,
  .cart {
    backdrop-filter: blur(15px);
    border: 2px solid ${highlight};
    border-radius: 20px 0 0 20px;
    height: 100vh;
    position: fixed;
    max-width: 100vw;
    min-width: 300px;
    right: 0;
    top: 0;
    transition: transform 0.3s ease-out;

    &--open {
      transform: translateX(0);
    }

    &--closed {
      transform: translateX(100%);
    }

    &__contentContainer {
      display: flex;
      flex-direction: column;
      height: 100%;
      position: relative;
    }

    &__controlContainer {
      box-shadow: 0 0 20px 0px ${highlight};
      border-radius: 17px 0 0 0;
      background: ${highlight + "cc"};
      backdrop-filter: blur(10px);
      /* opacity: 0.75; */
      text-align: left;
      width: 100%;
    }

    &__control {
      background: none;
      border: none;
      outline: none;
      padding: 15px;
      filter: none;
      transition: transform 0.3s ease-out, filter 0.3s ease-out;
      transform: translateX(0);
      &:hover,
      &:focus {
        cursor: pointer;
        transform: translateX(-100) scale(1.15);
      }
      &--closed {
        transform: translateX(-100%);
        &:hover {
          transform: translateX(-100%) scale(1.15);
        }
        svg {
          fill: ${highlight};
        }
      }
      &--open svg {
        fill: ${background};
      }
    }

    svg {
      /* fill: ${background}; */
      transition: fill 0.3s ease-out;
      width: 50px;
    }

    &__items {
      height: calc(100% - 75px);
      position: relative;
      overflow-y: scroll;
    }

    &__total {
      color: ${highlight};
      display: block;
      font-size: 20px;
      font-weight: 400;
      margin-top: 15px;
      padding: 15px;
      position: relative;
      &:before {
        background: ${highlight};
        content: "";
        position: absolute;
        left: 0;
        height: 2px;
        top: 0;
        width: 75%;
      }
    }

    &__sum {
      font-weight: 700;
    }
  }
`;

export const cartItemStyles = css`
  &.item,
  .item {
    display: flex;
    font-size: 18px;
    list-style: none;
    margin: 15px;
    &__details {
      flex-grow: 1;
    }
    &__imageContainer {
      display: inline-block;
      height: 15vmin;
      margin-right: 15px;
      width: 15vmin;
    }

    &__image {
      /* border: 1px solid ${highlight}; */
      box-shadow: 0 20px 16px -10px ${highlight + "99"};
      border-radius: 10px;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }

    &__nameContainer {
      width: 100%;
    }

    &__priceContainer {
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
      background: ${background};
      border: none;
      color: ${highlight};
      font-weight: 700;
      font-size: 18px;
    }
    &__btn {
      background: ${highlight};
      border-radius: 5px;
      color: ${background};
      min-width: 30px;
      padding: 3px 5px;
      transition: background 0.25s ease-in, color 0.25s ease-in;
      &:hover {
        background: ${background};
        color: ${highlight};
        transition: background 0.2s ease-out, color 0.2s ease-out;
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
      font-weight: 400;
      font-size: 0.75em;
      margin: 2em 0 0;
      text-align: right;
    }
    &__label {
      align-items: center;
      display: flex;
      font-style: italic;
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 0;
      padding-right: 50px;
      position: relative;
      white-space: space nowrap;
      &:after {
        background: ${highlight};
        border-radius: 1px;
        content: "";
        flex-grow: 1;
        height: 2px;
        width: auto;
        position: relative;
        margin-left: 25px;
      }
    }
  }
  .formInput {
    align-items: center;
    color: ${highlight};
    display: flex;
    margin-bottom: 10px;
    padding: 10px 0;
    &__labelText {
    }
    &__input {
      background: transparent;
      outline: none;
      border: none;
      border-radius: 5px 0px;
      border-bottom: 1px solid ${highlight};
      flex-grow: 1;
      padding: 5px 0;
      margin-left: 10px;
      transform: filter 0.2s ease-out;
      &::placeholder {
        color: ${highlight + "aa"};
      }
      &:not(:placeholder-shown) {
        filter: contrast(200%) brightness(1);
      }
    }
  }
  button[type="submit"] {
    margin-top: 25px;
    align-self: flex-end;
    min-width: 33%;
  }
`;

export const modalStyles = css`
  &.modal,
  .modal {
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    backdrop-filter: blur(10px);
    transition: opacity 0.2s ease-out;
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
      background: ${background};
      border: 1px solid ${highlight};
      border-radius: 20px;
      box-shadow: 0 10px 30px 0px ${highlight + "66"};
      max-width: 750px;
      padding: 40px;
      position: relative;
      width: 50vw;
    }
    &__close {
      position: absolute;
      top: 20px;
      right: 20px;
      text-align: center;
      border: none;
      border-radius: 50% !important;
    }
  }
`;
