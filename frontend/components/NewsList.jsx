import NewsCard from "./NewsCard";

export default function NewsList({ news }) {
  if (!news?.length) return (
    <div className="empty-state">
      <div className="empty-state-icon">📰</div>
      <p>No news found</p>
    </div>
  );

  return (
    <div className="grid">
      {news.map((item, index) => (
        <NewsCard key={item._id} news={item} isNew={index === 0} />
      ))}
    </div>
  );
}
