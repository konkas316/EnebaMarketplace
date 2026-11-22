
import { useState } from "react";
import { Link } from "react-router-dom";
import type { CartItem } from "../App";

type CheckoutPageProps = {
  cartItems: CartItem[];
  clearCart: () => void;
};

type PurchasedItem = {
  title: string;
  seller: string;
  price: string;
  key: string;
};

function getPrice(price: string): number {
  return parseFloat(price.replace(/[^\d.]/g, "")) || 0;
}

function CheckoutPage({ cartItems, clearCart }: CheckoutPageProps) {
  const [orderItems, setOrderItems] = useState<PurchasedItem[]>([]);
  const [total, setTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + getPrice(item.price),
    0
  );

  const completeCheckout = async () => {
    if (processing) return;

    if (cartItems.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    const savedUser = localStorage.getItem("user");

    if (!savedUser) {
      setMessage("Please log in before checkout.");
      return;
    }

    setProcessing(true);
    setMessage("Processing your order...");

    try {
      const user = JSON.parse(savedUser);

      const response = await fetch(
        "http://localhost:8000/api/checkout.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            items: cartItems.map((item) => ({
              title: item.title,
              seller: item.seller,
            })),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Checkout failed.");
        return;
      }

      setOrderItems(data.items);
      setTotal(Number(data.total));
      clearCart();
      setMessage("Order completed successfully!");
    } catch {
      setMessage("Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (orderItems.length > 0) {
    return (
      <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
        <h2>Order Successful!</h2>
        <p>{message}</p>

        <h3>Purchased Games</h3>

        {orderItems.map((item, index) => (
          <div
            key={`${item.title}-${item.seller}-${index}`}
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
              Price: <strong>{getPrice(item.price).toFixed(2)}€</strong>
            </p>
            <p>Digital Key: <strong>{item.key}</strong></p>
          </div>
        ))}

        <h3>Total Paid: {total.toFixed(2)}€</h3>
        <Link to="/">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Checkout</h2>

      {cartItems.length === 0 ? (
        <>
          <p>{message || "Your cart is empty."}</p>
          <Link to="/store">Return to Store</Link>
        </>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <div key={`${item.id}-${index}`}>
              <p>
                {item.title} — {item.seller} —{" "}
                {getPrice(item.price).toFixed(2)}€
              </p>
            </div>
          ))}

          <h3>Total: {cartTotal.toFixed(2)}€</h3>

          {message && <p>{message}</p>}

          <button
            onClick={completeCheckout}
            disabled={processing}
            style={{
              padding: "12px 24px",
              cursor: processing ? "not-allowed" : "pointer",
            }}
          >
            {processing ? "Processing..." : "Place Order"}
          </button>
        </>
      )}
    </div>
  );
}

export default CheckoutPage;
