import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../utils/auth";
import { updateUserProfile } from "../utils/walletUtils";
import Notice from "../components/Notice";
import "../styles/signup.css";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    
    // Validation
    if (!email || !password) {
      setNotice({ message: "Email and password required", type: "error" });
      return;
    }

    if (!email.includes("@")) {
      setNotice({ message: "Please enter a valid email", type: "error" });
      return;
    }

    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);

    if (!res.success) {
      setNotice({ message: res.message, type: res.type });
      return;
    }

    setNotice({ message: res.message, type: res.type });
    
    // Update wallet profile
    setTimeout(() => {
      updateUserProfile({ userName: res.user.username || res.user.email });
      window.dispatchEvent(new Event('walletUpdated'));
      navigate('/');
    }, 1500);
  }

  return (
    <div className="signup-page">
      <Notice 
        message={notice.message} 
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />
      
      <div className="container signup-inner">
        <div className="signup-card">
          <div className="signup-left">
            <h1>Sign in</h1>
            <p className="lead">Sign in to access your account and play games.</p>

            <form className="signup-form" onSubmit={handleSubmit}>
              <label>
                Email
                <input 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="you@company.com"
                  type="email"
                  disabled={loading}
                />
              </label>

              <label>
                Password
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Your password"
                  disabled={loading}
                />
              </label>

              <div className="form-actions">
                <button 
                  className="btn-primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </form>

            <p className="text-center mt-3">
              Don't have an account? <a href="/signup" style={{ color: "#007bff", cursor: "pointer" }}>Sign up</a>
            </p>
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
