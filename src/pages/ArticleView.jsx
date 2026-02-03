import { useState } from "react";
import { useParams } from "react-router-dom";
import articlesData from "../data/articles";
import Comment from "../components/Comment";
import "../styles/articleview.css";

export default function ArticleView() {
  const { id } = useParams();
  const article = articlesData.find((a) => a.id === Number(id));

  const initialComments = Array.isArray(article?.comments)
    ? article.comments
    : [];

  const numericCommentsCount = !Array.isArray(article?.comments)
    ? article?.comments || 0
    : 0;

  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");

  if (!article) return <div className="not-found">Article not found</div>;

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    setComments([
      ...comments,
      {
        id: Date.now(),
        user: "CurrentUser",
        text: newComment,
        replies: [],
      },
    ]);
    setNewComment("");
  };

  return (
    <div className="article-page">
      <div className="article-layout">
        {/* MAIN CONTENT */}
        <main className="article-card">
          <header className="article-header">
            <h1>{article.title}</h1>

            <div className="article-meta">
              <span>
                By <strong>{article.author}</strong>
              </span>
              <span>• {article.createdAt}</span>
              {article.rating && (
                <span className="rating">⭐ {article.rating}</span>
              )}
            </div>
          </header>

          <div className="article-content">{article.content}</div>

          {/* COMMENTS */}
          <section className="comments">
            <h3>
              Comments ({numericCommentsCount + comments.length})
            </h3>

            {comments.map((c) => (
              <Comment key={c.id} comment={c} />
            ))}

            <div className="comment-box">
              <textarea
                placeholder="Write a thoughtful comment…"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button onClick={handleAddComment}>Post Comment</button>
            </div>
          </section>
        </main>

        {/* SIDEBAR */}
        <aside className="article-sidebar">
          <div className="sidebar-card sticky">
            <div className="stats">
              <Stat label="Recommends" value={article.recommends} />
              <Stat label="Views" value={article.views} />
              <Stat
                label="Comments"
                value={numericCommentsCount + comments.length}
              />
            </div>

            <button className="btn-primary">Apply / Reply</button>
            <button className="btn-outline">Save Article</button>

            <div className="author-card">
              <div className="avatar">
                {article.author?.[0]}
              </div>
              <div>
                <div className="author-name">{article.author}</div>
                <div className="muted">
                  Top Author · Member since 2024
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
