"use client";

export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      value={value}
      placeholder="Search news instantly..."
      onChange={(e) => onChange(e.target.value)}
      className="search-input"
    />
  );
}
