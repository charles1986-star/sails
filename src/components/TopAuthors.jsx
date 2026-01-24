const authors = [
  { name: "John Doe", avatar: "👨‍✈️" },
  { name: "Alice Smith", avatar: "👩‍✈️" },
  { name: "Bob Johnson", avatar: "🧑‍✈️" },
  { name: "Maria Garcia", avatar: "👩‍✈️" },
];

export default function TopAuthors() {
  return (
    <div className="top-authors">
      {authors.map((a) => (
        <div key={a.name} className="author">
          <span className="avatar">{a.avatar}</span>
          <span>{a.name}</span>
        </div>
      ))}
    </div>
  );
}
