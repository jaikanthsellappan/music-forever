import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

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
        body: JSON.stringify({ email, username, password }) 
      };
  
      const res = await fetch("https://lz26am3j71.execute-api.us-east-1.amazonaws.com/prod/register_New_User", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), 
      });
  
      // const data = await res.json();

      const rawBody = await res.text();
    const parsed = JSON.parse(rawBody); // Top-level object with statusCode, body

    const data = typeof parsed.body === 'string' ? JSON.parse(parsed.body) : parsed.body;

    if (parsed.statusCode !== 200 || data.error) {
      setError(data.error || "Registration failed.");
    }
    else {
      alert("User Registred Successfully!");
        router.push("/login");
    }
  
      // if (res.ok) {
      //   alert("User Registred Successfully!");
      //   router.push("/login");
      // } else {
      //   setError(data.error || "Registration failed.");
      // }
    } catch (err) {
      console.error("Register error:", err);
      setError("Something went wrong.");
    }
  };

  return (
    <>
      <Head>
        <title>Music Forever | Register</title>
      </Head>
 
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-800 px-4 text-white">
        <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-2xl w-full max-w-md">
          <h1 className="text-4xl font-extrabold mb-4 text-center bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent font-mono tracking-wide">
            🎵 Music Forever
          </h1>
 
          <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">Register</h2>
 
          <input
            type="email"
            placeholder="Email"
            className="w-full bg-gray-900 text-white border border-purple-400 p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
 
          <input
            type="text"
            placeholder="Username"
            className="w-full bg-gray-900 text-white border border-purple-400 p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
 
          <input
            type="password"
            placeholder="Password"
            className="w-full bg-gray-900 text-white border border-purple-400 p-3 mb-4 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
 
          <button
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white py-2 rounded font-semibold transition duration-300"
          >
            Register
          </button>
 
          {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
 
          <p className="mt-6 text-center text-sm text-gray-700">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-bold underline transition">
              Login here
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
