export type CartItem = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
};

const CART_KEY = "silent-yahya-cart";

// Get Cart
export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];

  const cart = localStorage.getItem(CART_KEY);

  return cart ? JSON.parse(cart) : [];
}

// Save Cart
export function saveCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Add Product
export function addToCart(product: Omit<CartItem, "quantity">) {
  const cart = getCart();

  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart(cart);
}

// Remove Product
export function removeFromCart(id: string) {
  const cart = getCart().filter((item) => item._id !== id);

  saveCart(cart);
}

// Increase Quantity
export function increaseQuantity(id: string) {
  const cart = getCart();

  const item = cart.find((i) => i._id === id);

  if (item) item.quantity++;

  saveCart(cart);
}

// Decrease Quantity
export function decreaseQuantity(id: string) {
  const cart = getCart();

  const item = cart.find((i) => i._id === id);

  if (!item) return;

  item.quantity--;

  if (item.quantity <= 0) {
    removeFromCart(id);
    return;
  }

  saveCart(cart);
}

// Cart Total
export function getCartTotal() {
  return getCart().reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
}

// Total Items
export function getCartCount() {
  return getCart().reduce(
    (total, item) => total + item.quantity,
    0
  );
}

// Clear Cart
export function clearCart() {
  localStorage.removeItem(CART_KEY);
}