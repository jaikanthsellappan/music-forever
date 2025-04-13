import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
 
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
    const res = await fetch("https://f30g2f7svf.execute-api.us-east-1.amazonaws.com/subscriptions/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
 
    const raw = await res.json();
 
    // Parse the stringified body
    const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw.body;
 
    if (res.ok) setSubscriptions(data.subscriptions || []);
  };
 
 
  const handleRemove = async (song: Song) => {
    await fetch("https://e5h0bgt284.execute-api.us-east-1.amazonaws.com/unSubscribe/unSubscribe", {
      method: "POST",
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
 
    try {
      const res = await fetch("https://qxpiv0ra7c.execute-api.us-east-1.amazonaws.com/myQuery/myQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(query),
      });
 
      const raw = await res.json();
 
      let data;
      try {
        data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw.body;
      } catch (e) {
        console.error("Failed to parse Lambda body:", e);
        setMessage("Unexpected server response.");
        return;
      }
 
      if (res.ok && data.results && data.results.length > 0) {
        setResults(data.results);
      } else {
        setResults([]);
        setMessage("No result is retrieved. Please query again.");
      }
    } catch (error) {
      console.error("Query request failed:", error);
      setMessage("Something went wrong with your request.");
    }
  };
 
 
 
  const handleSubscribe = async (song: Song) => {
    const res = await fetch("https://sv2nox5i89.execute-api.us-east-1.amazonaws.com/subscribe/mySubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, song }),
    });
 
    if (res.ok) {
      // Add to subscriptions
      setSubscriptions([...subscriptions, song]);
 
      // Remove from query results
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
    <>
      <Head>
        <title>Music Forever | Main</title>
      </Head>
 
      <div className="min-h-screen bg-gradient-to-tr from-indigo-700 via-purple-700 to-pink-600 text-white p-6 space-y-6">
 
        {/* Header Section */}
<div className="bg-white/10 rounded-xl p-4 shadow-md relative">
  {/* Centered Title */}
  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent tracking-wider text-center">
    🎵 Music Forever
  </h1>
 
  {/* Top-right Logout Button */}
  <button
    onClick={handleLogout}
    className="absolute top-4 right-6 text-white hover:text-red-400 underline font-medium text-sm"
  >
    Logout
  </button>
</div>
 
 
        {/*Welcome & Subscriptions Section */}
        <div className="bg-white/10 rounded-xl p-4 shadow-md">
          <h2 className="text-xl font-semibold mb-4">Welcome, {username}!</h2>
          <h3 className="text-lg font-semibold mb-2">Your Subscriptions</h3>
          <div className="max-h-64 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 pr-2">
            {subscriptions.length === 0 ? (
              <p className="text-white/80">You have no subscriptions yet.</p>
            ) : (
              subscriptions.map((song, idx) => (
                <div key={idx} className="bg-white/10 border border-white/20 p-4 rounded shadow-sm">
                  <p><strong>Title:</strong> {song.title}</p>
                  <p><strong>Artist:</strong> {song.artist}</p>
                  <p><strong>Album:</strong> {song.album}</p>
                  <p><strong>Year:</strong> {song.year}</p>
                  <img src={song.image_url} alt="artist" className="w-32 h-32 mt-2 rounded" />
                  <button
                    onClick={() => handleRemove(song)}
                    className="mt-2 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
 
        {/*Search Box */}
        <div className="bg-white/10 rounded-xl p-4 shadow-md">
          <h3 className="text-lg font-semibold mb-2">Search Music</h3>
          <div className="flex flex-wrap gap-2 mb-4 overflow-x-auto">
            <input
              placeholder="Title"
              className="flex-1 min-w-[120px] px-3 py-2 text-black rounded border focus:outline-none"
              value={query.title}
              onChange={(e) => setQuery({ ...query, title: e.target.value })}
              style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
            />
            <input
              placeholder="Artist"
              className="flex-1 min-w-[120px] px-3 py-2 text-black rounded border focus:outline-none"
              value={query.artist}
              onChange={(e) => setQuery({ ...query, artist: e.target.value })}
              style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
            />
            <input
              placeholder="Album"
              className="flex-1 min-w-[120px] px-3 py-2 text-black rounded border focus:outline-none"
              value={query.album}
              onChange={(e) => setQuery({ ...query, album: e.target.value })}
              style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
            />
            <input
              placeholder="Year"
              className="flex-1 min-w-[100px] px-3 py-2 text-black rounded border focus:outline-none"
              value={query.year}
              onChange={(e) => setQuery({ ...query, year: e.target.value })}
              style={{ overflowX: 'auto', whiteSpace: 'nowrap' }}
            />
          </div>
 
          <div className="flex gap-4 mb-2">
            <button
              onClick={handleQuery}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Query
            </button>
            <button
              onClick={() => {
                setQuery({ title: "", artist: "", album: "", year: "" });
                setResults([]);
                setMessage("");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear
            </button>
          </div>
          {message && <p className="text-red-300">{message}</p>}
        </div>
 
        {/*Results Box */}
        {results.length > 0 && (
          <div className="bg-white/10 rounded-xl p-4 shadow-md">
            <h3 className="text-lg font-semibold mb-2">Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-80 overflow-y-auto pr-2">
              {results.map((song, idx) => (
                <div key={idx} className="bg-white/10 border border-white/20 p-4 rounded shadow-sm">
                  <p><strong>Title:</strong> {song.title}</p>
                  <p><strong>Artist:</strong> {song.artist}</p>
                  <p><strong>Album:</strong> {song.album}</p>
                  <p><strong>Year:</strong> {song.year}</p>
                  <img src={song.image_url} alt="artist" className="w-32 h-32 mt-2 rounded" />
                  <button
                    onClick={() => handleSubscribe(song)}
                    className="mt-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Subscribe
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
 
 
}