import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'accepted': return '#14a800';
      case 'recommended': return '#ff9f43';
      case 'waiting': return '#f5365c';
      default: return '#999';
    }
  };

  return (
    <div className="article-card">
      <div className="stats">
        <span>⭐ {article.recommends || 0}</span>
        <span>👁 {article.views || 0}</span>
        <span>💬 {article.comments || 0}</span>
        <span style={{ marginLeft: 'auto', color: getStatusColor(article.status), fontWeight: 600 }}>
          {article.status}
        </span>
      </div>

      <Link to={`/articles/${article.id}`} className="article-link">
        <h3>{article.title}</h3>
        
        <p className="meta">
          By <strong>{article.author}</strong> • {formatDate(article.createdAt)}
        </p>

        <p className="excerpt">
          {article.content &&
            (article.content.length > 120
              ? article.content.slice(0, 120) + "..."
              : article.content)}
        </p>
      </Link>
    </div>
  );
}

