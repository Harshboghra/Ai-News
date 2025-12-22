const API = process.env.NEXT_PUBLIC_API_URL;

export async function searchNews(query) {
    const res = await fetch(
        `${API}/api/news/search?q=${encodeURIComponent(query)}`
    );
    return res.json();
}

export async function getLatestNews() {
    const res = await fetch(`${API}/api/news/latest`);
    return res.json();
}
