const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const fetchNews = async (query) => {
    const res = await fetch(`${API_BASE}/news/search?q=${query}`);
    return res.json();
};
