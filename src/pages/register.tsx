import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
  
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
  
    if (!passwordRegex.test(password)) {
      setError("Password must be at least 6 characters, one uppercase, one special character.");
      return;
    }
  
    try {
      const payload = {
        body: JSON.stringify({ email, username, password })  // 👈 double-wrapped
      };
  
      const res = await fetch("https://lz26am3j71.execute-api.us-east-1.amazonaws.com/prod/register_New_User", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),  // 👈 outer JSON.stringify
      });
  
      const data = await res.json();
  
      if (res.ok) {
        router.push("/login");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Register</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="text"
        placeholder="Username"
        className="w-full border p-2 mb-3"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleRegister}
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
      >
        Register
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <p className="mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 underline">Login here</a>
      </p>
    </div>
  );
}
