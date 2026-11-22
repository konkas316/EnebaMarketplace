import { Link } from "react-router-dom";
import type { CartItem } from "../App";

type CartPageProps = {
  cartItems: CartItem[];
  removeFromCart: (id: string) => void;
  clearCart: () => void;
};

function CartPage({
  cartItems,
  removeFromCart,
  clearCart,
}: CartPageProps) {
  const total = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.price.replace(/[^\d.]/g, "")) || 0);
  }, 0);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "12px",
              }}
            >
              <h3>{item.title}</h3>

              <p>Seller: {item.seller}</p>

              <p>
                Price: <strong>{item.price}</strong>
              </p>

              <button
                onClick={() => removeFromCart(item.id)}
              >
                Remove
              </button>
            </div>
          ))}

          <h3>Total: {total.toFixed(2)}€</h3>

          <button onClick={clearCart}>
            Clear Cart
          </button>

          {" "}

          <Link to="/checkout">
            <button>Checkout</button>
          </Link>
        </>
      )}

      <p>Total items: {cartItems.length}</p>
    </div>
  );
}

export default CartPage;