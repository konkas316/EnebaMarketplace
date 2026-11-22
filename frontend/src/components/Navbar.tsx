
import { Link } from "react-router-dom";

type NavbarProps = {
  cartCount: number;
  user?: {
    username: string;
    email: string;
  } | null;
  onLogout?: () => void;
};

function Navbar({ cartCount, user, onLogout }: NavbarProps) {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "20px",
        padding: "15px",
        flexWrap: "wrap",
      }}
    >
      <Link to="/">Home</Link>

      <Link to="/store">Store</Link>

      <Link to="/cart">
        Cart ({cartCount})
      </Link>

      {user ? (
        <>
          <span>Welcome, {user.username}</span>

          <Link to="/orders">Order History</Link>

          <button onClick={onLogout}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>

          <Link to="/register">Register</Link>
        </>
      )}
    </nav>
  );
}

export default Navbar;
