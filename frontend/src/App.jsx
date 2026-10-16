import { useEffect, useState } from "react";
import { api } from "./api.js";

function AuthForm({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await api(`/auth/${mode}`, { method: "POST", body: form });
      localStorage.setItem("token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <form className="card" onSubmit={submit}>
      <h2>{mode === "login" ? "Login" : "Create account"}</h2>
      {mode === "register" && <input placeholder="Name" value={form.name} onChange={set("name")} required />}
      <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
      <input type="password" placeholder="Password (6+ chars)" value={form.password} onChange={set("password")} required />
      {error && <p className="error">{error}</p>}
      <button type="submit">{mode === "login" ? "Login" : "Register"}</button>
      <p className="link" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "New here? Register" : "Have an account? Login"}
      </p>
    </form>
  );
}

function Menu({ cart, setCart }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api("/menu").then(setItems).catch(() => setItems([]));
  }, []);

  const add = (id) => setCart({ ...cart, [id]: (cart[id] || 0) + 1 });

  return (
    <div className="grid">
      {items.map((m) => (
        <div className="card" key={m._id}>
          <h3>{m.name}</h3>
          <p>{m.description}</p>
          <strong>₹{m.price}</strong>
          <button onClick={() => add(m._id)}>Add</button>
        </div>
      ))}
      {items.length === 0 && <p>No menu items yet. Run the seed script (see README).</p>}
    </div>
  );
}

function Cart({ cart, setCart }) {
  const [menu, setMenu] = useState([]);
  const [address, setAddress] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api("/menu").then(setMenu).catch(() => setMenu([]));
  }, []);

  const lines = menu.filter((m) => cart[m._id]);
  const total = lines.reduce((s, m) => s + m.price * cart[m._id], 0);

  const place = async () => {
    try {
      const items = lines.map((m) => ({ menuItemId: m._id, quantity: cart[m._id] }));
      await api("/orders", { method: "POST", body: { items, address } });
      setCart({});
      setAddress("");
      setMsg("Order placed!");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="card">
      <h2>Your cart</h2>
      {lines.map((m) => (
        <p key={m._id}>{m.name} × {cart[m._id]} — ₹{m.price * cart[m._id]}</p>
      ))}
      {lines.length === 0 && <p>Cart is empty.</p>}
      <strong>Total: ₹{total}</strong>
      <input placeholder="Delivery address" value={address} onChange={(e) => setAddress(e.target.value)} />
      <button disabled={!lines.length || !address} onClick={place}>Place order</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

function Orders() {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    api("/orders/mine").then(setOrders).catch(() => setOrders([]));
  }, []);
  return (
    <div>
      {orders.map((o) => (
        <div className="card" key={o._id}>
          <strong>{o.status}</strong> — ₹{o.total} — {new Date(o.createdAt).toLocaleString()}
          <p>{o.items.map((i) => `${i.name} × ${i.quantity}`).join(", ")}</p>
        </div>
      ))}
      {orders.length === 0 && <p>No orders yet.</p>}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("menu");
  const [cart, setCart] = useState({});

  if (!user) return <AuthForm onLogin={setUser} />;

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <div className="container">
      <nav>
        <h1>🍔 Food Delivery</h1>
        <button onClick={() => setTab("menu")}>Menu</button>
        <button onClick={() => setTab("cart")}>Cart ({Object.keys(cart).length})</button>
        <button onClick={() => setTab("orders")}>My orders</button>
        <button onClick={logout}>Logout ({user.name})</button>
      </nav>
      {tab === "menu" && <Menu cart={cart} setCart={setCart} />}
      {tab === "cart" && <Cart cart={cart} setCart={setCart} />}
      {tab === "orders" && <Orders />}
    </div>
  );
}
