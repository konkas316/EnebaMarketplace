
import { useState } from "react";
import { Navigate, Routes, Route, useNavigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import StorePage from "./pages/StorePage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OrderHistoryPage from "./pages/OrderHistoryPage";

export type CartItem = {
  id: string;
  title: string;
  seller: string;
  price: string;
};

export type User = {
  id: number;
  username: string;
  email: string;
};

function App() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const addToCart = (
    game: string,
    seller = "GameStore",
    price?: string
  ) => {
    const defaultPrices: Record<string, string> = {
      "Cyberpunk 2077": "29.99€",
      "Elden Ring": "39.99€",
      "GTA V": "14.99€",
      "Minecraft": "19.99€",
      "Baldur's Gate 3": "44.99€",
      "Helldivers 2": "34.99€",
    };

    const newItem: CartItem = {
      id: crypto.randomUUID(),
      title: game,
      seller,
      price: price ?? defaultPrices[game] ?? "0.00€",
    };

    setCartItems((previousItems) => {
      const alreadyAdded = previousItems.some(
        (item) => item.title === game
      );

      if (alreadyAdded) {
        return previousItems;
      }

      return [...previousItems, newItem];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleLogin = (loggedInUser: User) => {
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    clearCart();
    navigate("/");
  };

  return (
    <div>
      <Navbar
        cartCount={cartItems.length}
        user={user}
        onLogout={handleLogout}
      />

      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/orders" element={<OrderHistoryPage user={user} />} />

        <Route path="/store" element={<StorePage />} />

        <Route
          path="/product/:slug"
          element={<ProductPage addToCart={addToCart} />}
        />

        <Route
          path="/cart"
          element={
            <CartPage
              cartItems={cartItems}
              removeFromCart={removeFromCart}
              clearCart={clearCart}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            user ? (
              <CheckoutPage
                cartItems={cartItems}
                clearCart={clearCart}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/login"
          element={<LoginPage onLogin={handleLogin} />}
        />

        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </div>
  );
}

export default App;
