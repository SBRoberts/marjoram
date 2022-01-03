import { useViewModel } from "../../src";

const CART = "cart";

export type callbackType = (items: typeof products) => void;
export type productsType = typeof products;
export type productType = typeof products[0];

const getCart = (): productsType => JSON.parse(localStorage.getItem(CART));

export const cart = {
  total: 0,
  items: getCart() || [],
  subscribers: [] as callbackType[],
  subscribe(callback: callbackType) {
    this.notify();
    this.subscribers.push(callback);
  },
  notify() {
    this.subscribers.forEach((callback) => callback(this.items));
  },
  addItem(findId: number) {
    const cart = this.getAll();
    let product = cart.find(({ id }) => id === findId);

    // Product exists in cart
    if (product) {
      product.quantity++;
    } else {
      // Product does not yet exist in cart
      product = products.find(({ id }) => id === findId);
      product.quantity = 1;
      cart.push(product);
    }

    // If the product has been found in the cart or in the list of existing products
    if (product) {
      this.updateCart(cart);
    }
  },
  removeItem(findId: number) {
    const cart = this.getAll();
    let product = cart.find(({ id }) => id === findId);
    if (product) {
      product.quantity--;
      this.updateCart(cart.filter(({ quantity }) => quantity));
    }
  },
  getItem(findId: number) {
    const cart = this.getAll();
    return cart.find(({ id }) => id === findId);
  },
  updateCart(cartArray: typeof products) {
    localStorage.setItem(CART, JSON.stringify(cartArray));
    this.getAll();
    this.notify();
  },
  getAll() {
    let cart = localStorage.getItem(CART);
    if (!cart) {
      localStorage.setItem(CART, JSON.stringify(this.items));
    }
    this.items = JSON.parse(cart);
    return this.items;
  },
  removeAll: () => localStorage.setItem(CART, JSON.stringify([])),
};

cart.getAll();

export const products = [
  {
    id: 201,
    name: "Nulla",
    price: 207,
    description: "Culpa sed tenetur incidunt quia veniam sed molliti",
    likes: 78,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 202,
    name: "Corporis",
    price: 271,
    description: "Nam incidunt blanditiis odio inventore. Nobis volu",
    likes: 67,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1547514701-42782101795e?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 203,
    name: "Minus",
    price: 295,
    description: "Quod reiciendis aspernatur ipsum cum debitis. Quis",
    likes: 116,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1591287083773-9a52ba8184a4?ixid=MXwxMjA3fDB8MHxzZWFyY2h8N3x8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 204,
    name: "Qui",
    price: 280,
    description: "Occaecati dolore assumenda facilis error quaerat. ",
    likes: 78,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OHx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 209,
    name: "Similique",
    price: 262,
    description: "Autem blanditiis similique saepe excepturi at erro",
    likes: 44,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1552089123-2d26226fc2b7?ixid=MXwxMjA3fDB8MHxzZWFyY2h8OXx8ZnJ1aXR8ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 220,
    name: "Soluta",
    price: 109,
    description: "Quos accusamus distinctio voluptates ducimus neque",
    likes: 34,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTV8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 223,
    name: "Quos",
    price: 247,
    description: "Error voluptate recusandae reiciendis adipisci nec",
    likes: 188,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MTl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 224,
    name: "Sunt",
    price: 297,
    description: "Tempora sed explicabo quae recusandae vitae debiti",
    likes: 63,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MjR8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 225,
    name: "Nemo",
    price: 143,
    description: "Id pariatur at modi esse distinctio error. Dolores",
    likes: 116,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1439127989242-c3749a012eac?ixid=MXwxMjA3fDB8MHxzZWFyY2h8MzB8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 226,
    name: "Quo",
    price: 150,
    description: "Explicabo distinctio labore eius. Culpa provident ",
    likes: 157,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?ixid=MXwxMjA3fDB8MHxzZWFyY2h8NDl8fGZydWl0fGVufDB8fDB8&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 227,
    name: "Nobis",
    price: 195,
    description: "Reprehenderit iste quos amet. Natus consequatur in",
    likes: 30,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1560155016-bd4879ae8f21?ixid=MXwxMjA3fDB8MHxzZWFyY2h8M3x8YXZvY2Fkb3xlbnwwfHwwfA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
  {
    id: 228,
    name: "Explicabo",
    price: 253,
    description: "Nihil magni libero sapiente voluptate. Perspiciati",
    likes: 11,
    quantity: 0,
    image:
      "https://images.unsplash.com/photo-1587324438673-56c78a866b15?ixid=MXwxMjA3fDB8MHxzZWFyY2h8Mnx8bGVtb258ZW58MHx8MHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
  },
];
