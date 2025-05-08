import React, { useState, useEffect } from "react";
//react frontend audiosearch UI and query system
const AudioSearch = () => {
    const [query, setQuery] = useState("");
    const [results, setAudio] = useState([]);
    const [error, setError] = useState(null);

    const [license, setLicense] = useState("");
    const [source, setSource] = useState("");
    const [extension, setExtension] = useState("");
    const [filter, setFilter] = useState("");

    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const [page, setPage] = useState(1);
    
    const [hist_License, sethistLicense] = useState("");
    const [hist_Source, sethistSource] = useState("");
    const [hist_Extension, sethistExtension] = useState("");

//search for audio through key filters intakes perameters to re-search through history
    const handleSearch = async (customQuery = query, customLicense = license, customSource = source, customExtension = extension, custompage = page) => {
        if (!query.trim()) {
            setError("Please enter a search term.");
            return;
        }

        const searchParams = new URLSearchParams({
            q: customQuery,
            page: custompage,
            ...(customLicense && { license: customLicense }),
            ...(customSource && { source: customSource }),
            ...(customExtension && { extension: customExtension }),
        });

        try {
            const response = await fetch(`http://localhost:5000/search_audio?${searchParams}`, {
                credentials: "include"
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.results) {
                setAudio(data.results);
            } else {
                setAudio([]);
            }
//search for audio-filter by source, license and extentsion.
            await fetch("http://localhost:5000/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    search_q: customQuery,
                    license: customLicense,
                    source: customSource,
                    extension: customExtension,
                    media_type: "audio" 
                }),
                credentials: "include"
            });

            setError(null);
        } catch (e) {
            console.error("Error fetching images:", e);
            setError("Error Fetching audio. Please try again.");
            setAudio([]);
        }
    };
    //get user history for audio searches
    const fetchHistory = async (search_q = "") => {
        const response = await fetch(`http://localhost:5000/history${search_q ? `/search?q=${search_q}` : ""}`, {
            credentials: "include"
        });
        const data = await response.json();
        const media = data.filter(entry => entry.media_type === "audio");
        setHistory(media);
    };
    //delete a single entry
    const deleteEntry = async (id) => {
        await fetch(`http://localhost:5000/history/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        fetchHistory(filter);
    };
    //clear full history
    const clearAllHistory = async () => {
        await fetch("http://localhost:5000/history?media_type=audio", {
            method: "DELETE",
            credentials: "include"
        });
        fetchHistory();
    };
    //button integration
    useEffect(() => {
        if (showHistory) fetchHistory();
    }, [showHistory]);
    
    //UI interface to show functionality
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Audio Search</h2>
                <button onClick={() => setShowHistory(true)}>View History</button>
            </div>

            <input
                type="text"
                value={query}
                onChange={(e) => {setQuery(e.target.value); setPage(1);}}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search for audio..."
            />
            <button onClick={() => handleSearch()} style={{ marginLeft: "10px" }}>Search</button>

            <div style={{ marginTop: "10px" }}>
                <label>
                    License:
                    <select value={license} onChange={(e) => setLicense(e.target.value)}>
                        <option value="">Any</option>
                        <option value="cc0">CC0</option>
                        <option value="by">BY</option>
                        <option value="by-sa">BY-SA</option>
                        <option value="pdm">PDM</option>
                    </select>
                </label>
                <label style={{ marginLeft: "10px" }}>
                    Source:
                    <select value={source} onChange={(e) => setSource(e.target.value)}>
                        <option value="">Any</option>
                        <option value="jamendo">Jamendo</option>
                        <option value="freesound">Freesound</option>
                    </select>
                </label>
                <label style={{ marginLeft: "10px" }}>
                    File Type:
                    <select value={extension} onChange={(e) => setExtension(e.target.value)}>
                        <option value="">Any</option>
                        <option value="mp3">MP3</option>
                        <option value="ogg">OGG</option>
                        <option value="wav">WAV</option>
                    </select>
                </label>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <ul style={{ marginTop: "20px" }}>
                {results.map((item, index) => (
                    <li key={index}>
                        <strong>{item.title || "Untitled"}</strong> — <em>{item.creator || "Unknown artist"}</em>
                        <br />
                        <audio controls src={item.audio_url || item.url} style={{ width: "100%", marginTop: "5px" }} />
                    </li>
                ))}
            </ul>
            <div style={{ marginTop: "20px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
                onClick={() => {
                    if (page > 1) {
                        const newPage = page - 1;
                        setPage(newPage);
                        handleSearch(query, license, source, extension, newPage);
                    }
                }}
                disabled={page === 1}
            >
                Previous
            </button>

                <span>Page {page}</span>

                <button
                    onClick={() => {
                        const newPage = page + 1;
                        setPage(newPage);
                        handleSearch(query, license, source, extension, newPage);
                    }}
                >
                    Next
                </button>
            </div>

            {showHistory && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        width: "50%",
                        maxHeight: "80vh",
                        overflowY: "auto",
                        position: "relative"
                    }}>
                        <button
                            onClick={() => setShowHistory(false)}
                            style={{ position: "absolute", top: "20px", right: "20px", padding: "6px 20px" }}
                        >
                            Close
                        </button>

                        <h3>Audio Search History</h3>
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && fetchHistory(filter)}
                        />
                        <button onClick={() => fetchHistory(filter)} style={{ marginLeft: "10px" }}>Search History</button>

                        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                            <label>
                                License:
                                <select value={hist_License} onChange={(e) => sethistLicense(e.target.value)}>
                                    <option value="">Any</option>
                                    <option value="cc0">CC0</option>
                                    <option value="by">BY</option>
                                    <option value="by-sa">BY-SA</option>
                                    <option value="pdm">PDM</option>
                                </select>
                            </label>
                            <label style={{ marginLeft: "10px" }}>
                                Source:
                                <select value={hist_Source} onChange={(e) => sethistSource(e.target.value)}>
                                    <option value="">Any</option>
                                    <option value="jamendo">Jamendo</option>
                                    <option value="freesound">Freesound</option>
                                </select>
                            </label>
                            <label style={{ marginLeft: "10px" }}>
                                File Type:
                                <select value={hist_Extension} onChange={(e) => sethistExtension(e.target.value)}>
                                    <option value="">Any</option>
                                    <option value="mp3">MP3</option>
                                    <option value="ogg">OGG</option>
                                    <option value="wav">WAV</option>
                                </select>
                            </label>
                        </div>

                        <div style={{ textAlign: "right" }}>
                            <button onClick={clearAllHistory}>Clear History</button>
                        </div>

                        <div>
                            {history
                                .filter(entry =>
                                    (hist_License === "" || entry.license === hist_License) &&
                                    (hist_Source === "" || entry.source === hist_Source) &&
                                    (hist_Extension === "" || entry.extension === hist_Extension)
                                )
                                .map(entry => (
                                    <div
                                        key={entry.id}
                                        onClick={() => {
                                            setQuery(entry.search_q);
                                            setLicense(entry.license || "");
                                            setSource(entry.source || "");
                                            setExtension(entry.extension || "");
                                            setShowHistory(false);
                                            handleSearch(entry.search_q, entry.license || "", entry.source || "", entry.extension || "");
                                        }}
                                        style={{
                                            border: "1px solid #ccc",
                                            borderRadius: "6px",
                                            padding: "10px",
                                            marginBottom: "10px",
                                            backgroundColor: "#f9f9f9",
                                            cursor: "pointer"
                                        }}
                                    >
                                        <strong>{entry.search_q}</strong>
                                        <div style={{ fontSize: "0.85em", marginTop: "4px", color: "#555" }}>
                                            {entry.license && <div>License: {entry.license}</div>}
                                            {entry.source && <div>Source: {entry.source}</div>}
                                            {entry.extension && <div>File Type: {entry.extension}</div>}
                                            {entry.timestamp && <div>Searched: {new Date(entry.timestamp).toLocaleString()}</div>}
                                        </div>
                                        <div style={{ textAlign: "right", marginTop: "6px" }}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteEntry(entry.id);
                                                }}
                                                style={{
                                                    backgroundColor: "#dc3545",
                                                    color: "white",
                                                    padding: "4px 8px",
                                                    border: "none",
                                                    borderRadius: "4px",
                                                    cursor: "pointer"
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioSearch;