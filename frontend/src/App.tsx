import { useState } from "react";
import axios from "axios";

type Song = {
  artist: string;
  title: string;
  genre: string;
  reason: string;
};

function App() {
  const [mood, setMood] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);

  const getRecommendations = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/recommend",
        {
          client_mood: mood,
        }
      );

      setSongs([response.data.Playlist]);
      console.log([response.data])
      console.log("The first title:",Object.values(songs)[1])
      console.log("type of song ",typeof(songs))
    
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>🎵 Mood Music AI</h1>

      <input
        type="text"
        placeholder="How are you feeling?"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        style={{ padding: "0.5rem", width: "300px" }}
      />

      <button
        onClick={getRecommendations}
        style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
      >
        Get Songs
      </button>

      <div style={{ marginTop: "2rem" }}>
        {songs.map((song, index) => {
          return(

          
          <div
            key={index}
            style={{
              border: "1px solid gray",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h3>
              {song.title} — {song.artist}
            </h3>

            <p>
              <strong>Genre:</strong> {song.genre}
            </p>

            <p>
              <strong>Reason:</strong> {song.reason}
            </p>
          </div>
)})}
      </div>
    </div>
  );
}

export default App;