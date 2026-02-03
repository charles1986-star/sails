// src/data/libraryCategories.js
export const libraryCategories = [
  {
    id: "navigation",
    name: "Navigation",
    children: [
      {
        id: "sail-nav",
        name: "Sail Navigation",
        children: [
          { id: "wind", name: "Wind & Weather" },
          { id: "charts", name: "Charts & Maps" },
        ],
      },
      {
        id: "engine",
        name: "Engine Assisted",
        children: [],
      },
    ],
  },
  {
    id: "design",
    name: "Ship Design",
    children: [
      {
        id: "hull",
        name: "Hull & Structure",
        children: [],
      },
    ],
  },
  {
    id: "media",
    name: "Media",
    children: [
      { id: "video", name: "Videos", children: [] },
      { id: "audio", name: "Podcasts", children: [] },
    ],
  },
];
