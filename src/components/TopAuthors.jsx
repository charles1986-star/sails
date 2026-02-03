const authors = [
  { name: "John Doe", avatar: "👨‍✈️", articles: 42 },
  { name: "Alice Smith", avatar: "👩‍✈️", articles: 38 },
  { name: "Bob Johnson", avatar: "🧑‍✈️", articles: 29 },
  { name: "Maria Garcia", avatar: "👩‍✈️", articles: 25 },
];

export default function TopAuthors() {
  return (
    <section className="top-authors-section">
      <div className="top-authors-header">
        <h2>Top Authors</h2>
        <span className="subtitle">Most active contributors</span>
      </div>

      <div className="top-authors">
        {authors.map((a, i) => (
          <div key={a.name} className="author-card">
            <div className="author-rank">#{i + 1}</div>

            <div className="author-avatar">{a.avatar}</div>

            <div className="author-info">
              <div className="author-name">{a.name}</div>
              <div className="author-meta">
                {a.articles} articles published
              </div>
            </div>

            <button className="follow-btn">Follow</button>
          </div>
        ))}
      </div>
    </section>
  );
}
