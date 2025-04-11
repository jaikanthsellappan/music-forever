import { useRouter } from "next/router";
import { useState } from "react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ Store user info in sessionStorage
        sessionStorage.setItem('email', email);
        sessionStorage.setItem('username', data.username); // <-- Make sure your API returns this

        router.push('/main'); // ✅ Redirect to main page
      } else {
        setError(data.error || "Email or password is invalid.");
      }
    } catch (err) {
      setError("Login error. Please try again.");
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      <input
        type="email"
        placeholder="Email"
        className="w-full border p-2 mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border p-2 mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        Login
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      <p className="mt-4">
        Don’t have an account?{" "}
        <a href="/register" className="text-blue-600 underline">
          Register here
        </a>
      </p>
    </div>
  );
}
