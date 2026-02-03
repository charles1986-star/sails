import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../utils/auth";
import Notice from "../components/Notice";
import "../styles/auth.css";

export default function SignUp() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ message: "", type: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ message: "", type: "" });

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      setNotice({ message: "All fields are required", type: "error" });
      return;
    }

    if (username.length < 3) {
      setNotice({ message: "Username must be at least 3 characters", type: "error" });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setNotice({ message: "Please enter a valid email address", type: "error" });
      return;
    }

    if (password.length < 6) {
      setNotice({ message: "Password must be at least 6 characters", type: "error" });
      return;
    }

    if (password !== confirmPassword) {
      setNotice({ message: "Passwords do not match", type: "error" });
      return;
    }

    setLoading(true);
    const res = await signupUser({ username, email, password, confirmPassword });
    setLoading(false);

    if (!res.success) {
      setNotice({ message: res.message, type: res.type });
      return;
    }

    setNotice({ message: res.message, type: res.type });
    
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <div className="auth-page">
      <Notice 
        message={notice.message} 
        type={notice.type}
        onClose={() => setNotice({ message: "", type: "" })}
      />

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>

        <label>Username</label>
        <input 
          value={username} 
          onChange={e => setUsername(e.target.value)} 
          placeholder="Enter username (min 3 chars)"
          disabled={loading}
        />

        <label>Email</label>
        <input 
          value={email} 
          onChange={e => setEmail(e.target.value)} 
          placeholder="Enter your email"
          type="email"
          disabled={loading}
        />

        <label>Password</label>
        <input 
          value={password} 
          onChange={e => setPassword(e.target.value)} 
          placeholder="Enter password (min 6 chars)"
          type="password"
          disabled={loading}
        />

        <label>Confirm Password</label>
        <input 
          value={confirmPassword} 
          onChange={e => setConfirmPassword(e.target.value)} 
          placeholder="Confirm your password"
          type="password"
          disabled={loading}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Signing Up..." : "Sign Up"}
        </button>

        <p className="redirect">
          Already have an account? <span onClick={() => navigate("/login")} style={{ cursor: "pointer", color: "#007bff" }}>Login</span>
        </p>
      </form>
    </div>
  );
}
