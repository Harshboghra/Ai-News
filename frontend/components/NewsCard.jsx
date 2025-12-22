export default function NewsCard({ news }) {
  return (
    <div className="card">
      <h3>{news.title}</h3>
      <p>{news.description}</p>

      <small>
        {news.source} • {new Date(news.publishedAt).toLocaleString()}
      </small>

      <a href={news.sourceUrl} target="_blank">
        Read more →
      </a>
    </div>
  );
}
