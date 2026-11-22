

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import type { User } from "../App";

type OrderItem = {
  title: string;
  seller: string;
  price: number;
  key: string;
};

type Order = {
  id: number;
  created_at: string;
  total: number;
  status: string;
  items: OrderItem[];
};

type OrderHistoryPageProps = {
  user: User | null;
};

function OrderHistoryPage({ user }: OrderHistoryPageProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    const userId = user.id;

    async function fetchOrders() {
      try {
        const response = await fetch(
          "http://localhost:8000/api/order-history.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: userId }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load order history."
          );
        }

        setOrders(data.orders || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const toggleOrder = (orderId: number) => {
    setExpandedOrders((previous) =>
      previous.includes(orderId)
        ? previous.filter((id) => id !== orderId)
        : [...previous, orderId]
    );
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading order history...</p>;
  }

  if (error) {
    return <p style={{ color: "red", padding: "20px" }}>{error}</p>;
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h2>Order History</h2>

      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map((order) => {
          const isExpanded = expandedOrders.includes(order.id);

          return (
            <div
              key={order.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "15px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 5px 0" }}>
                    Order #{order.id}
                  </h3>

                  <p style={{ margin: 0, color: "gray" }}>
                    {new Date(order.created_at).toLocaleString()}
                    {" · "}
                    {order.items.length} item(s)
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <strong>{order.total.toFixed(2)}€</strong>
                  
                </div>
              </div>

              <div style={{ marginTop: "15px" }}>
                <button onClick={() => toggleOrder(order.id)}>
                  {isExpanded ? "Hide details ▲" : "View details ▼"}
                </button>
              </div>

              {isExpanded && (
                <div
                  style={{
                    borderTop: "1px solid #ccc",
                    marginTop: "15px",
                    paddingTop: "10px",
                  }}
                >
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "10px 0",
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <strong>{item.title}</strong>

                      <p>Seller: {item.seller}</p>

                      <p>Price: {item.price.toFixed(2)}€</p>

                      <p>
                        Digital Key: <strong>{item.key}</strong>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default OrderHistoryPage;
