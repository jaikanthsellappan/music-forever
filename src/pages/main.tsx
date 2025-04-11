import { useEffect, useState } from "react";
import { useRouter } from "next/router";

interface Song {
  title: string;
  artist: string;
  album: string;
  year: string;
  image_url: string;
}

export default function MainPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [subscriptions, setSubscriptions] = useState<Song[]>([]);
  const [query, setQuery] = useState({ title: "", artist: "", album: "", year: "" });
  const [results, setResults] = useState<Song[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("email");
    const storedUsername = sessionStorage.getItem("username");
    if (!storedEmail || !storedUsername) {
      router.push("/login");
      return;
    }
    setEmail(storedEmail);
    setUsername(storedUsername);
    fetchSubscriptions(storedEmail);
  }, []);

  const fetchSubscriptions = async (email: string) => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) setSubscriptions(data.subscriptions || []);
  };

  const handleRemove = async (song: Song) => {
    await fetch("/api/unsubscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, song }),
    });
    setSubscriptions(subscriptions.filter((s) => s.title !== song.title));
  };

  const handleQuery = async () => {
    setMessage("");
    const filled = Object.values(query).filter((v) => v.trim() !== "").length;
    if (filled === 0) {
      setMessage("Please fill at least one field.");
      return;
    }

    const res = await fetch("/api/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(query),
    });
    const data = await res.json();
    if (res.ok && data.results.length > 0) {
      setResults(data.results);
    } else {
      setResults([]);
      setMessage("No result is retrieved. Please query again.");
    }
  };

  const handleSubscribe = async (song: Song) => {
    const res = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, song }),
    });
  
    if (res.ok) {
      // ✅ Add to subscriptions
      setSubscriptions([...subscriptions, song]);
  
      // ✅ Remove from query results
      const updatedResults = results.filter((s) => s.title !== song.title);
      setResults(updatedResults);
    } else {
      console.error("Subscribe failed");
    }
  };
  
  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/login");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Welcome, {username}!</h1>
        <button onClick={handleLogout} className="text-red-500 underline">
          Logout
        </button>
      </div>

      {/* Subscription Area */}
      <h2 className="text-xl font-semibold mb-2">Your Subscriptions</h2>
      {subscriptions.length === 0 ? (
        <p className="mb-4">You have no subscriptions yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {subscriptions.map((song, idx) => (
            <div key={idx} className="border p-4 rounded shadow-sm">
              <p><strong>Title:</strong> {song.title}</p>
              <p><strong>Artist:</strong> {song.artist}</p>
              <p><strong>Album:</strong> {song.album}</p>
              <p><strong>Year:</strong> {song.year}</p>
              <img src={song.image_url} alt="artist" className="w-32 h-32 mt-2" />
              <button
                onClick={() => handleRemove(song)}
                className="mt-2 bg-red-500 text-white px-3 py-1 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Query Area */}
      <h2 className="text-xl font-semibold mb-2">Search Music</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        <input
          placeholder="Title"
          className="border p-2"
          value={query.title}
          onChange={(e) => setQuery({ ...query, title: e.target.value })}
        />
        <input
          placeholder="Artist"
          className="border p-2"
          value={query.artist}
          onChange={(e) => setQuery({ ...query, artist: e.target.value })}
        />
        <input
          placeholder="Album"
          className="border p-2"
          value={query.album}
          onChange={(e) => setQuery({ ...query, album: e.target.value })}
        />
        <input
          placeholder="Year"
          className="border p-2"
          value={query.year}
          onChange={(e) => setQuery({ ...query, year: e.target.value })}
        />
      </div>
      <div className="flex gap-4 mb-2">
  <button
    onClick={handleQuery}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Search
  </button>
  <button
    onClick={() => {
      setQuery({ title: "", artist: "", album: "", year: "" });
      setResults([]);
      setMessage("");
    }}
    className="bg-gray-500 text-white px-4 py-2 rounded"
  >
    Clear
  </button>
</div>

{message && <p className="text-red-500 mt-2">{message}</p>}


      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((song, idx) => (
              <div key={idx} className="border p-4 rounded shadow-sm">
                <p><strong>Title:</strong> {song.title}</p>
                <p><strong>Artist:</strong> {song.artist}</p>
                <p><strong>Album:</strong> {song.album}</p>
                <p><strong>Year:</strong> {song.year}</p>
                <img src={song.image_url} alt="artist" className="w-32 h-32 mt-2" />
                <button
                  onClick={() => handleSubscribe(song)}
                  className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
                >
                  Subscribe
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
