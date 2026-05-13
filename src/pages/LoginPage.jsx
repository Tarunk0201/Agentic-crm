import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    tenantName: "",
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const rememberedTenant = localStorage.getItem("rememberedTenant");
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedTenant && rememberedUsername) {
      setFormData((prev) => ({
        ...prev,
        tenantName: rememberedTenant,
        username: rememberedUsername,
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tenant/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "An unknown error occurred." }));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      if (rememberMe) {
        localStorage.setItem("rememberedTenant", formData.tenantName);
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedTenant");
        localStorage.removeItem("rememberedUsername");
      }
      login(data);
      navigate("/contacts");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-stretch min-h-screen bg-gray-50">
      {/* Left side */}
      <div className="flex flex-col justify-center items-center w-full p-8 lg:w-1/2 sm:p-12">
        <div className="w-full max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Enter your details to access your account.
          </p>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Tenant Name Input */}
            <div>
              <label
                htmlFor="tenantName"
                className="block text-sm font-medium text-gray-700"
              >
                Tenant Name
              </label>
              <div className="mt-1">
                <input
                  id="tenantName"
                  name="tenantName"
                  type="text"
                  autoComplete="organization"
                  required
                  value={formData.tenantName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Username/Email Input */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                User Name
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                />
                <label
                  htmlFor="remember-me"
                  className="block ml-2 text-sm text-gray-900"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                {/* <a
                  href="#"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Forgot your password?
                </a> */}
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>
            </div>

            {/* <div className="mt-6 text-sm text-center">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <a
                  href="#"
                  className="font-medium text-orange-600 hover:text-orange-500"
                >
                  Register Now
                </a>
              </p>
            </div> */}
          </form>
        </div>
      </div>

      {/* Right side */}
      <div className="items-center justify-center hidden w-1/2 p-12 text-white bg-orange-600 lg:flex">
        <div className="max-w-md text-center">
          {/* The user will add an image here. For now, display text from the image. */}
          <h2 className="text-4xl font-bold">
            Effortlessly manage your team and operations.
          </h2>
          <p className="mt-4 text-lg">
            Log in to access your CRM dashboard and manage your team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
