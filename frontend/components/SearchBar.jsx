"use client";

export default function SearchBar({ onSearch }) {
  return (
    <input
      type="text"
      placeholder="Search news..."
      onChange={(e) => onSearch(e.target.value)}
      className="search-input"
    />
  );
}
