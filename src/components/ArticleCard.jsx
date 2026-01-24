import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  return (
    <div className="article-card">
      <div className="stats">
        ⭐ {article.recommends}
        👁 {article.views}
        💬 {article.comments}
      </div>

      <Link to={`/articles/${article.id}`} className="article-link">
        <h3>{article.title}</h3>
        <p className="meta">By <strong>{article.author}</strong></p>

        <p className="excerpt">
          {article.content &&
            (article.content.length > 100
              ? article.content.slice(0, 100) + "..."
              : article.content)}
        </p>
      </Link>
    </div>
  );
}
