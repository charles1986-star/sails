import { useState } from "react";

export default function ArticleCategoryTree({
  categories,
  selected,
  onSelect,
  level = 0
}) {
  const [open, setOpen] = useState({});

  return (
    <ul className={`category-level level-${level}`}>
      
    </ul>
  );
}
