import { useState } from "react";
import { useNavigate } from "react-router-dom";
import articlesData from "../data/articles";
import "../styles/articles.css";

export default function NewArticle() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [projectType, setProjectType] = useState("fixed");
  const [budget, setBudget] = useState("");
  const [experience, setExperience] = useState("any");
  const [tags, setTags] = useState("");
  const navigate = useNavigate();

  const categories = [
    "Development & IT",
    "Design & Creative",
    "Writing & Translation",
    "Marketing",
    "Finance & Accounting",
    "Other",
  ];

  const handlePost = () => {
    if (!title || !content) return;
    const newArticle = {
      id: Date.now(),
      title,
      author: "CurrentUser",
      category: category || "Other",
      content,
      rating: 0,
      comments: [],
      status: "published",
      createdAt: new Date().toISOString().slice(0, 10),
      projectType,
      budget,
      experience,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    articlesData.push(newArticle); // simple frontend update
    navigate("/articles");
  };

  return (
    <div className="new-article-page">
      <div className="container new-article-grid">
        <main className="new-article-main">
          <h1>Create a new article / post</h1>

          <div className="form-section">
            <label className="label">Title</label>
            <input
              type="text"
              placeholder="Write a clear title for your article"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-row">
            <div className="form-section" style={{ flex: 1 }}>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-section" style={{ width: 180 }}>
              <label className="label">Project type</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="input-field"
              >
                <option value="fixed">Fixed-price</option>
                <option value="hourly">Hourly</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <label className="label">Description</label>
            <textarea
              placeholder="Describe your article or post in detail. Include requirements, goals, and context."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="textarea-field"
            />
          </div>

          <div className="form-row">
            <div className="form-section" style={{ width: 220 }}>
              <label className="label">Budget</label>
              <input
                type="text"
                placeholder="e.g. $500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-section" style={{ width: 220 }}>
              <label className="label">Experience level</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="input-field"
              >
                <option value="any">Any</option>
                <option value="entry">Entry level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <label className="label">Skills / Tags</label>
            <input
              type="text"
              placeholder="Comma-separated skills (e.g. React, routing, UX)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="input-field"
            />
          </div>

          <div className="form-actions">
            <button className="btn-primary" onClick={handlePost}>Post Article</button>
            <button className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </main>

        <aside className="new-article-aside">
          <div className="aside-card">
            <h3>Tips for a great post</h3>
            <ul className="tips-list">
              <li>Write a clear, descriptive title.</li>
              <li>Provide the context and goals in the description.</li>
              <li>Add relevant skills so the right people find you.</li>
              <li>Choose project type and budget to match expectations.</li>
            </ul>
          </div>

          <div className="aside-card preview">
            <h4>Preview</h4>
            <div className="preview-title">{title || "Article title preview"}</div>
            <div className="preview-meta muted">{category || "Category"} • {projectType}</div>
            <div className="preview-content">{content ? content.slice(0, 180) + (content.length > 180 ? "..." : "") : "Article excerpt preview..."}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
