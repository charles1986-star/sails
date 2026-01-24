import "../styles/cart.css";

export default function CartPage({ cart, setCart }) {
  const handleQuantityChange = (id, quantity) => {
    const updated = cart.map((p) =>
      p.id === id ? { ...p, quantity: Math.max(1, quantity) } : p
    );
    setCart(updated);
  };

  const handleRemove = (id) => {
    setCart(cart.filter((p) => p.id !== id));
  };

  const totalPrice = cart
    .reduce((sum, p) => sum + parseFloat(p.price.replace("$", "")) * p.quantity, 0)
    .toFixed(2);

  const handleCheckout = () => {
    alert("Purchase completed! Total: $" + totalPrice);
    setCart([]); // clear cart after purchase
  };

  if (cart.length === 0) return <h2 style={{ padding: "40px" }}>Cart is empty</h2>;

  return (
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {cart.map((p) => {
            const priceNumber = parseFloat(p.price.replace("$", ""));
            return (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>${priceNumber.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    min="1"
                    value={p.quantity}
                    onChange={(e) =>
                      handleQuantityChange(p.id, parseInt(e.target.value))
                    }
                  />
                </td>
                <td>${(priceNumber * p.quantity).toFixed(2)}</td>
                <td>
                  <button className="btn-remove" onClick={() => handleRemove(p.id)}>
                    ✕
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="cart-footer">
        <h3>Total: ${totalPrice}</h3>
        <button className="btn-primary" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
    </div>
  );
}
