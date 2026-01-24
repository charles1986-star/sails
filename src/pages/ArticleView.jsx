import { useState } from "react";
import { useParams } from "react-router-dom";
import articlesData from "../data/articles";
import Comment from "../components/Comment";
import "../styles/articles.css";

export default function ArticleView() {
  const { id } = useParams();
  const article = articlesData.find((a) => a.id === parseInt(id)) || null;

  const initialComments = Array.isArray(article?.comments)
    ? article.comments
    : [];
  const numericCommentsCount = !Array.isArray(article?.comments)
    ? article?.comments || 0
    : 0;

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  if (!article) return <div>Article not found</div>;

  const handleAddComment = () => {
    if (!newComment) return;
    const comment = {
      id: Date.now(),
      user: "CurrentUser",
      text: newComment,
      replies: [],
    };
    setComments([...comments, comment]);
    setNewComment("");
  };

  return (
    <div className="article-view-page">
      <div className="article-view">
        <main className="article-main">
          <header className="article-header">
            <h1 className="article-title">{article.title}</h1>
            <div className="article-meta">
              <div>
                By <strong>{article.author}</strong>
              </div>
              <div className="muted">Published: {article.createdAt}</div>
            </div>
          </header>

          <section className="article-body">
            <div className="article-intro">
              <p className="rating">{article.rating ? `Rating: ${article.rating} ⭐` : null}</p>
            </div>

            <div className="article-content">{article.content}</div>
          </section>

          <section className="comments-section">
            <h3>Comments ({numericCommentsCount + comments.length})</h3>
            <div className="comments-list">
              {comments.map((c) => (
                <Comment key={c.id} comment={c} />
              ))}
            </div>

            <div className="new-comment">
              <textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button className="btn-primary" onClick={handleAddComment}>
                Comment
              </button>
            </div>
          </section>
        </main>

        <aside className="article-aside">
          <div className="aside-card">
            <div className="aside-stats">
              <div className="stat">
                <div className="stat-value">{article.recommends}</div>
                <div className="stat-label">Recommends</div>
              </div>
              <div className="stat">
                <div className="stat-value">{article.views}</div>
                <div className="stat-label">Views</div>
              </div>
              <div className="stat">
                <div className="stat-value">{numericCommentsCount + comments.length}</div>
                <div className="stat-label">Comments</div>
              </div>
            </div>

            <div className="aside-actions">
              <button className="btn-primary full">Apply / Reply</button>
              <button className="btn-secondary full">Save</button>
            </div>

            <div className="author-box">
              <div className="author-name">{article.author}</div>
              <div className="author-meta muted">Top author • Member since 2024</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
