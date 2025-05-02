// import React, { useState, useEffect } from "react";

// const ImageSearch = () => {
//     const [query, setQuery] = useState("");
//     const [images, setImages] = useState([]);
//     const [error, setError] = useState(null);
//     const [history, setHistory] = useState([]);
//     const [showHistory, setShowHistory] = useState(false);
//     const [filter, setFilter] = useState("");


//     const [license, setLicense] = useState("");
//     const [source, setSource] = useState("");
//     const [extension, setExtension] = useState("");
    

//     const handleSearch = async () => {
//         try {
//             const response = await fetch(`http://localhost:5000/search_images?q=${query}`);
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             const data = await response.json();

//             if (data.results) {
//                 setImages(data.results.map(img => ({
//                     url: img.thumbnail || img.url,
//                     title: img.title || 'Untitled Image'
//                 })));
//             } else {
//                 setImages([]);
//             }
            
//             await fetch("http://localhost:5000/history", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ search_q: query })
//             });

//             setError(null);
//         } catch (e) {
//             console.error("Error fetching images:", e);
//             setError("Error fetching images. Please try again.");
//             setImages([]);
//         }
//     };

//     const fetchHistory = async (search_q = "") => {
//         const res = await fetch(`http://localhost:5000/history${search_q ? `/search?q=${search_q}` : ""}`);
//         const data = await res.json();
//         setHistory(data);
//     };

//     const deleteEntry = async (id) => {
//         await fetch(`http://localhost:5000/history/${id}`, { method: "DELETE" });
//         fetchHistory(filter);
//     };

//     const clearAllHistory = async () => {
//         await fetch("http://localhost:5000/history", { method: "DELETE" });
//         fetchHistory();
//     };

//     useEffect(() => {
//         if (showHistory) fetchHistory();
//     }, [showHistory]);

//     return (
//         <div>
//             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//                 <h2>Image Search</h2>
//                 <button onClick={() => setShowHistory(true)}>View History</button>
//             </div>
//             <input
//                 type="text"
//                 value={query}
//                 onChange={(e) => setQuery(e.target.value)}
//                 placeholder="Search for images..."
//             />
//             <button onClick={handleSearch}>Search</button>
//             {error && <p style={{ color: "red" }}>{error}</p>}
//             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
//                 {images.length > 0 ? (
//                     images.map((image, index) => (
//                         <div key={index}>
//                             <img src={image.url} alt={image.title} style={{ maxWidth: "100%" }} />
//                             <p>{image.title}</p>
//                         </div>
//                     ))
//                 ) : (
//                     <p>No images to display. Try searching for something!</p>
//                 )}
//             </div>

//             {showHistory && (
//                 <div style={{
//                     position: "fixed",
//                     top: 0,
//                     left: 0,
//                     width: "100vw",
//                     height: "100vh",
//                     backgroundColor: "rgba(0, 0, 0, 0.5)",
//                     display: "flex",
//                     justifyContent: "center",
//                     alignItems: "center",
//                     zIndex: 1000
//                 }}>
//                     <div style={{
//                         backgroundColor: "white",
//                         padding: "20px",
//                         borderRadius: "10px",
//                         width: "400px",
//                         maxHeight: "80vh",
//                         overflowY: "auto"
//                     }}>
//                         <h3>Search History</h3>
//                         <input
//                             type="text"
//                             placeholder="Filter history..."
//                             value={filter}
//                             onChange={(e) => setFilter(e.target.value)}
//                         />
//                         <button onClick={() => fetchHistory(filter)}>Filter</button>
//                         <button onClick={clearAllHistory}>Clear History</button>
//                         <button onClick={() => setShowHistory(false)}>Close</button>
//                         <ul>
//                             {history.map(entry => (
//                                 <li key={entry.id} style={{ display: "flex", justifyContent: "space-between" }}>
//                                     {entry.search_q}
//                                     <button onClick={() => deleteEntry(entry.id)}>Delete</button>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default ImageSearch;

import React, { useState, useEffect } from "react";

const ImageSearch = () => {
    const [query, setQuery] = useState("");
    const [images, setImages] = useState([]);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [filter, setFilter] = useState("");

    // Filters
    const [license, setLicense] = useState("");
    const [source, setSource] = useState("");
    const [extension, setExtension] = useState("");

    const handleSearch = async () => {
        const searchParams = new URLSearchParams({
            q: query,
            ...(license && { license }),
            ...(source && { source }),
            ...(extension && { extension }),
        });

        try {
            const response = await fetch(`http://localhost:5000/search_images?${searchParams.toString()}`, {
                credentials: "include"
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.results) {
                setImages(data.results.map(img => ({
                    url: img.thumbnail || img.url,
                    title: img.title || 'Untitled Image'
                })));
            } else {
                setImages([]);
            }

            // Save search to history
            await fetch("http://localhost:5000/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ search_q: query }),
                credentials: "include"
            });

            setError(null);
        } catch (e) {
            console.error("Error fetching images:", e);
            setError("Error fetching images. Please try again.");
            setImages([]);
        }
    };

    const fetchHistory = async (search_q = "") => {
        const res = await fetch(`http://localhost:5000/history${search_q ? `/search?q=${search_q}` : ""}`, {
            credentials: "include"
        });
        const data = await res.json();
        setHistory(data);
    };

    const deleteEntry = async (id) => {
        await fetch(`http://localhost:5000/history/${id}`, {
            method: "DELETE",
            credentials: "include"
        });
        fetchHistory(filter);
    };

    const clearAllHistory = async () => {
        await fetch("http://localhost:5000/history", {
            method: "DELETE",
            credentials: "include"
        });
        fetchHistory();
    };

    useEffect(() => {
        if (showHistory) fetchHistory();
    }, [showHistory]);

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2>Image Search</h2>
                <button onClick={() => setShowHistory(true)}>View History</button>
            </div>

            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for images..."
            />
            <button onClick={handleSearch}>Search</button>

            {/* Filters */}
            <div style={{ marginTop: "10px", marginBottom: "20px" }}>
                <label>
                    License:
                    <select value={license} onChange={(e) => setLicense(e.target.value)}>
                        <option value="">Any</option>
                        <option value="cc0">CC0</option>
                        <option value="by">BY</option>
                        <option value="by-sa">BY-SA</option>
                    </select>
                </label>

                <label style={{ marginLeft: "10px" }}>
                    Source:
                    <select value={source} onChange={(e) => setSource(e.target.value)}>
                        <option value="">Any</option>
                        <option value="flickr">Flickr</option>
                        <option value="wikimedia">Wikimedia</option>
                    </select>
                </label>

                <label style={{ marginLeft: "10px" }}>
                    File Type:
                    <select value={extension} onChange={(e) => setExtension(e.target.value)}>
                        <option value="">Any</option>
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                        <option value="svg">SVG</option>
                    </select>
                </label>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                {images.length > 0 ? (
                    images.map((image, index) => (
                        <div key={index}>
                            <img src={image.url} alt={image.title} style={{ maxWidth: "100%" }} />
                            <p>{image.title}</p>
                        </div>
                    ))
                ) : (
                    <p>No images to display. Try searching for something!</p>
                )}
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
                        width: "400px",
                        maxHeight: "80vh",
                        overflowY: "auto"
                    }}>
                        <h3>Search History</h3>
                        <input
                            type="text"
                            placeholder="Filter history..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                        <button onClick={() => fetchHistory(filter)}>Filter</button>
                        <button onClick={clearAllHistory}>Clear History</button>
                        <button onClick={() => setShowHistory(false)}>Close</button>
                        <ul>
                            {history.map(entry => (
                                <li key={entry.id} style={{ display: "flex", justifyContent: "space-between" }}>
                                    {entry.search_q}
                                    <button onClick={() => deleteEntry(entry.id)}>Delete</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageSearch;