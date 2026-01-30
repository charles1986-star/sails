import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../utils/auth";
import { updateUserProfile } from "../utils/walletUtils";
import "../styles/signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("freelancer");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    const res = signupUser({ name, email, password });
    if (!res.success) {
      alert(res.message);
      return;
    }
    // update demo wallet profile
    updateUserProfile({ userName: name });
    window.dispatchEvent(new Event('walletUpdated'));
    navigate("/");
  }

  return (
    <div className="signup-page">
      <div className="container signup-inner">
        <div className="signup-card">
          <div className="signup-left">
            <h1>Create your account</h1>
            <p className="lead">Join Sail to hire talent or find work in sail transport.</p>

            <form className="signup-form" onSubmit={handleSubmit}>
              <label>
                Full name
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
              </label>

              <label>
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </label>

              <label>
                Password
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a password" />
              </label>

              <div className="role-row">
                <label className={role === "freelancer" ? "selected" : ""}>
                  <input type="radio" name="role" value="freelancer" checked={role === "freelancer"} onChange={() => setRole("freelancer")} />
                  I'm looking for work
                </label>

                <label className={role === "client" ? "selected" : ""}>
                  <input type="radio" name="role" value="client" checked={role === "client"} onChange={() => setRole("client")} />
                  I'm hiring
                </label>
              </div>

              <div className="form-actions">
                <button className="btn-primary" type="submit">Create account</button>
              </div>
            </form>
          </div>

          <div className="signup-right">
            <h3>Why Sail?</h3>
            <ul>
              <li>Access vetted professionals specialized in maritime transport</li>
              <li>Secure contracts and simple billing</li>
              <li>Project posting and talent matching in one place</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
