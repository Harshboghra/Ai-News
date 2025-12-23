import React from "react";
import { NewsCategory, CategoryInfo } from "../types/category";

interface CategoryFilterProps {
  selectedCategory: NewsCategory | null;
  onCategoryChange: (category: NewsCategory | null) => void;
  className?: string;
}

const CATEGORIES: CategoryInfo[] = [
  {
    id: "world",
    name: "world",
    displayName: "World",
    icon: "🌍",
    color: "#2563eb",
    description: "Global news and international affairs",
    priority: 1,
    language: "en",
  },
  {
    id: "india",
    name: "india",
    displayName: "India",
    icon: "🇮🇳",
    color: "#dc2626",
    description: "News from India and Indian affairs",
    priority: 1,
    language: "en",
  },
  {
    id: "business",
    name: "business",
    displayName: "Business",
    icon: "💼",
    color: "#059669",
    description: "Business news and financial markets",
    priority: 1,
    language: "en",
  },
  {
    id: "sports",
    name: "sports",
    displayName: "Sports",
    icon: "⚽",
    color: "#7c3aed",
    description: "Sports news and events",
    priority: 1,
    language: "en",
  },
  {
    id: "technology",
    name: "technology",
    displayName: "Technology",
    icon: "💻",
    color: "#ea580c",
    description: "Tech news and innovations",
    priority: 1,
    language: "en",
  },
  {
    id: "health",
    name: "health",
    displayName: "Health",
    icon: "🏥",
    color: "#16a34a",
    description: "Health and medical news",
    priority: 1,
    language: "en",
  },
  {
    id: "science",
    name: "science",
    displayName: "Science",
    icon: "🔬",
    color: "#0891b2",
    description: "Scientific discoveries and research",
    priority: 1,
    language: "en",
  },
  {
    id: "entertainment",
    name: "entertainment",
    displayName: "Entertainment",
    icon: "🎬",
    color: "#db2777",
    description: "Entertainment and celebrity news",
    priority: 1,
    language: "en",
  },
  {
    id: "startup",
    name: "startup",
    displayName: "Startup",
    icon: "🚀",
    color: "#7f1d1d",
    description: "Startup and innovation news",
    priority: 1,
    language: "en",
  },
];

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  className = "",
}: CategoryFilterProps) {
  const handleCategoryClick = (category: NewsCategory | null) => {
    onCategoryChange(category);
  };

  return (
    <div className={`category-filter ${className}`}>
      <div className="category-header">
        <h3 className="category-title">📰 Categories</h3>
        <p className="category-subtitle">Filter news by category</p>
      </div>

      {/* Desktop Category Tabs */}
      <div className="category-tabs">
        <button
          className={`btn btn-ghost category-tab ${
            !selectedCategory ? "active" : ""
          }`}
          onClick={() => handleCategoryClick(null)}
          title="All Categories"
        >
          📰 All Categories
        </button>

        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            className={`btn btn-ghost category-tab ${
              selectedCategory === category.name ? "active" : ""
            }`}
            onClick={() => handleCategoryClick(category.name as NewsCategory)}
            title={category.description}
            style={{
              borderColor:
                selectedCategory === category.name
                  ? category.color
                  : "transparent",
              background:
                selectedCategory === category.name
                  ? `linear-gradient(135deg, ${category.color}20, transparent)`
                  : "transparent",
              color:
                selectedCategory === category.name
                  ? category.color
                  : "var(--text-secondary)",
              fontWeight: selectedCategory === category.name ? "600" : "400",
            }}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.displayName}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
