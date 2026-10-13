import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
      const navigate = useNavigate();

      const [formData, setFormData] = useState({
            email: "",
            password: "",
      });

      const [error, setError] = useState("");
      const [loading, setLoading] = useState(false);

      const handleChange = (e) => {
            setFormData({
                  ...formData,
                  [e.target.name]: e.target.value,
            });
      };

      const handleSubmit = async (e) => {
            e.preventDefault();

            setError("");
            setLoading(true);

            try {
                  const response = await api.post("/auth/login", formData);

                  const { token, user } = response.data;

                  // Save login information
                  localStorage.setItem("token", token);
                  localStorage.setItem("user", JSON.stringify(user));

                  // Go to dashboard
                  navigate("/dashboard");

            } catch (error) {
                  setError(
                        error.response?.data?.message ||
                        "Unable to login. Please try again."
                  );
            } finally {
                  setLoading(false);
            }
      };

      return (
            <div className="login-page">
                  <div className="login-container">

                        <div className="login-header">
                              <h1>Hostel Management System</h1>
                              <p>Student Login</p>
                        </div>

                        {error && (
                              <div className="error-message">
                                    {error}
                              </div>
                        )}

                        <form onSubmit={handleSubmit}>

                              <div className="form-group">
                                    <label htmlFor="email">Email Address</label>

                                    <input
                                          type="email"
                                          id="email"
                                          name="email"
                                          placeholder="Enter your email"
                                          value={formData.email}
                                          onChange={handleChange}
                                          required
                                    />
                              </div>

                              <div className="form-group">
                                    <label htmlFor="password">Password</label>

                                    <input
                                          type="password"
                                          id="password"
                                          name="password"
                                          placeholder="Enter your password"
                                          value={formData.password}
                                          onChange={handleChange}
                                          required
                                    />
                              </div>

                              <button
                                    type="submit"
                                    disabled={loading}
                              >
                                    {loading ? "Logging in..." : "Login"}
                              </button>

                        </form>

                        <div className="register-link">
                              <p>
                                    Don't have an account?{" "}
                                    <Link to="/register">
                                          Register here
                                    </Link>
                              </p>
                        </div>

                  </div>
            </div>
      );
}

export default Login;