import React, { useState } from 'react';
import { useRouter } from 'next/router';

export default function Register() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    const res = await fetch('/api/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
      headers: { 'Content-Type': 'application/json' }
    });
    

    const data = await res.json();

    if (res.ok) {
      router.push('/login');
    } else {
      setError(data.error || 'Something went wrong');
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto mt-12">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <input
        className="border px-4 py-2 mb-2 w-full"
        type="email"
        placeholder="Email (must be @gmail.com)"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border px-4 py-2 mb-2 w-full"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <input
        className="border px-4 py-2 mb-2 w-full"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        onClick={handleRegister}
        className="bg-green-500 text-white px-4 py-2 rounded w-full"
      >
        Register
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
      <p className="mt-4">
        Already have an account?{' '}
        <a href="/login" className="text-blue-600 underline">Login</a>
      </p>
    </div>
  );
}
