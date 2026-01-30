import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/auth";
import { updateUserProfile } from "../utils/walletUtils";
import "../styles/signup.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = loginUser(email, password);
    if (!res.success) {
      alert(res.message);
      return;
    }
    // update wallet profile name for demo
    updateUserProfile({ userName: res.user.name || res.user.email });
    window.dispatchEvent(new Event('walletUpdated'));
    navigate('/');
  }

  return (
    <div className="signup-page">
      <div className="container signup-inner">
        <div className="signup-card">
          <div className="signup-left">
            <h1>Sign in</h1>
            <p className="lead">Sign in to access your account and play games.</p>

            <form className="signup-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </label>

              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" />
              </label>

              <div className="form-actions">
                <button className="btn-primary" type="submit">Sign in</button>
              </div>
            </form>
          </div>

          <div className="signup-right">
            <h3>Welcome back</h3>
            <p>Use your account to manage purchases, plays, and profile.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
