import NewsCard from "./NewsCard";

export default function NewsList({ news }) {
  if (!news?.length) return <p>No news found</p>;

  return (
    <div className="grid">
      {news.map((item) => (
        <NewsCard key={item._id} news={item} />
      ))}
    </div>
  );
}
