const filters = [
  { key: "waiting", label: "Waiting Articles" },
  { key: "accepted", label: "Accepted Articles" },
  { key: "denied", label: "Denied Articles" },
  { key: "recommended", label: "Recommended Articles" },
  { key: "favourite", label: "Favourite Articles" },
  { key: "draft", label: "Drafts" },
];

export default function MyArticlesSidebar({ active, onSelect }) {
  return (
    <aside className="left-sidebar">
      <h3>My Articles</h3>
      {filters.map((f) => (
        <button
          key={f.key}
          className={active === f.key ? "active" : ""}
          onClick={() => onSelect(f.key)}
        >
          {f.label}
        </button>
      ))}
    </aside>
  );
}
