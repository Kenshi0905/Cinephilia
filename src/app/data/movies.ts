export interface Movie {
  id: string;
  title: string;
  year: number;
  director: string;
  rating: number;
  poster: string;
  backdrop: string;
  review: string;
  watchedDate: string;
  runtime: number;
  genre: string[];
}

export const movies: Movie[] = [
  {
    id: "1",
    title: "Nocturne in Silence",
    year: 2024,
    director: "Elena Márquez",
    rating: 4.5,
    poster: "https://images.unsplash.com/photo-1639749601642-8d30474f249f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZmlsbSUyMHBvc3RlciUyMGRhcmt8ZW58MXx8fHwxNzcwOTYzNjA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1639749601642-8d30474f249f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZmlsbSUyMHBvc3RlciUyMGRhcmt8ZW58MXx8fHwxNzcwOTYzNjA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "A meditation on solitude and memory. Márquez's patient camera work creates spaces where silence speaks louder than dialogue. The film's deliberate pacing mirrors the protagonist's internal journey, inviting contemplation rather than passive consumption.",
    watchedDate: "2026-02-10",
    runtime: 127,
    genre: ["Drama", "Art House"]
  },
  {
    id: "2",
    title: "The Ephemeral",
    year: 2023,
    director: "James Chen",
    rating: 5.0,
    poster: "https://images.unsplash.com/photo-1770902895934-b04a10daa893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBtb3ZpZSUyMHBvc3RlciUyMGFydGlzdGljfGVufDF8fHx8MTc3MDk2MzYwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1770902895934-b04a10daa893?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaW5lbWF0aWMlMjBtb3ZpZSUyMHBvc3RlciUyMGFydGlzdGljfGVufDF8fHx8MTc3MDk2MzYwN3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "Transcendent. A masterclass in visual storytelling that lingers in the mind long after the credits roll. Chen's use of natural light and carefully composed frames elevates this beyond conventional narrative cinema.",
    watchedDate: "2026-02-08",
    runtime: 142,
    genre: ["Experimental", "Drama"]
  },
  {
    id: "3",
    title: "Fragments",
    year: 2024,
    director: "Sofia Andersson",
    rating: 4.0,
    poster: "https://images.unsplash.com/photo-1759547020777-14a1ca4c3fdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2luZW1hJTIwcG9zdGVyfGVufDF8fHx8MTc3MDkyNjAxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1759547020777-14a1ca4c3fdf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aW50YWdlJTIwY2luZW1hJTIwcG9zdGVyfGVufDF8fHx8MTc3MDkyNjAxNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "Andersson weaves together disparate moments into a haunting tapestry of loss and remembrance. The non-linear structure demands attention but rewards patience with profound emotional resonance.",
    watchedDate: "2026-02-05",
    runtime: 98,
    genre: ["Drama", "Mystery"]
  },
  {
    id: "4",
    title: "Shadowlands",
    year: 2025,
    director: "Marcus Webb",
    rating: 3.5,
    poster: "https://images.unsplash.com/photo-1734967639158-ec80db8e23a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBob3VzZSUyMGZpbG0lMjBub2lyfGVufDF8fHx8MTc3MDk2MzYwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1734967639158-ec80db8e23a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnQlMjBob3VzZSUyMGZpbG0lMjBub2lyfGVufDF8fHx8MTc3MDk2MzYwOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "A stylish noir that leans heavily into atmosphere. While the plot occasionally meanders, the cinematography and production design create a world worth inhabiting.",
    watchedDate: "2026-02-01",
    runtime: 115,
    genre: ["Noir", "Thriller"]
  },
  {
    id: "5",
    title: "Liminal Spaces",
    year: 2024,
    director: "Yuki Tanaka",
    rating: 4.5,
    poster: "https://images.unsplash.com/photo-1664555777880-d852dfdb2ac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNpbmVtYSUyMGFydHxlbnwxfHx8fDE3NzA5NjM2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1664555777880-d852dfdb2ac8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNpbmVtYSUyMGFydHxlbnwxfHx8fDE3NzA5NjM2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "Tanaka's abstract approach to narrative cinema challenges and rewards in equal measure. The film exists in the space between waking and dreaming, creating an experience that defies traditional categorization.",
    watchedDate: "2026-01-28",
    runtime: 134,
    genre: ["Experimental", "Art House"]
  },
  {
    id: "6",
    title: "Resonance",
    year: 2025,
    director: "Clara Dubois",
    rating: 4.0,
    poster: "https://images.unsplash.com/photo-1751823886813-0cfc86cb9478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtb3ZpZSUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzA5NjM2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1751823886813-0cfc86cb9478?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBtb3ZpZSUyMGFlc3RoZXRpY3xlbnwxfHx8fDE3NzA5NjM2MDh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "An intimate character study wrapped in stunning visuals. Dubois captures the complexity of human connection with sensitivity and grace, never resorting to melodrama.",
    watchedDate: "2026-01-25",
    runtime: 108,
    genre: ["Drama", "Romance"]
  },
  {
    id: "7",
    title: "Through Darkness",
    year: 2023,
    director: "Michael Torres",
    rating: 3.5,
    poster: "https://images.unsplash.com/photo-1570123493702-356c46e79396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFtYXRpYyUyMHBvcnRyYWl0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzcwOTYzNjExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1570123493702-356c46e79396?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFtYXRpYyUyMHBvcnRyYWl0JTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzcwOTYzNjExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "Torres delivers a tense psychological drama that explores the boundaries between reality and perception. Strong performances anchor an occasionally uneven narrative.",
    watchedDate: "2026-01-20",
    runtime: 121,
    genre: ["Thriller", "Drama"]
  },
  {
    id: "8",
    title: "Horizon Lines",
    year: 2024,
    director: "Anna Bergström",
    rating: 4.5,
    poster: "https://images.unsplash.com/photo-1732808460864-b8e5eb489a52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb29keSUyMGxhbmRzY2FwZSUyMGF0bW9zcGhlcmljfGVufDF8fHx8MTc3MDk2MzYxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1732808460864-b8e5eb489a52?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb29keSUyMGxhbmRzY2FwZSUyMGF0bW9zcGhlcmljfGVufDF8fHx8MTc3MDk2MzYxMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "Bergström's landscape becomes a character itself—vast, indifferent, beautiful. The film's sparse dialogue allows the visuals and sound design to carry the emotional weight, creating a hypnotic viewing experience.",
    watchedDate: "2026-01-15",
    runtime: 145,
    genre: ["Drama", "Art House"]
  },
  {
    id: "9",
    title: "Midnight Architecture",
    year: 2025,
    director: "David Park",
    rating: 4.0,
    poster: "https://images.unsplash.com/photo-1642287040066-2bd340523289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFyY2hpdGVjdHVyZSUyMG5pZ2h0fGVufDF8fHx8MTc3MDg5MjA4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1642287040066-2bd340523289?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGFyY2hpdGVjdHVyZSUyMG5pZ2h0fGVufDF8fHx8MTc3MDg5MjA4Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "A love letter to the city at night. Park's camera glides through urban spaces with balletic precision, finding poetry in concrete and glass. The nocturnal setting amplifies themes of isolation and connection.",
    watchedDate: "2026-01-12",
    runtime: 102,
    genre: ["Drama", "Urban"]
  },
  {
    id: "10",
    title: "The Unraveling",
    year: 2024,
    director: "Lucia Rossi",
    rating: 5.0,
    poster: "https://images.unsplash.com/photo-1636524390936-5ef600dd1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJyZWFsJTIwdmlzdWFsJTIwYXJ0fGVufDF8fHx8MTc3MDk2MzYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1636524390936-5ef600dd1a8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJyZWFsJTIwdmlzdWFsJTIwYXJ0fGVufDF8fHx8MTc3MDk2MzYxMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "A surrealist masterpiece that defies conventional narrative logic while maintaining emotional coherence. Rossi's vision is singular—bold, uncompromising, and utterly mesmerizing. This is cinema as pure art.",
    watchedDate: "2026-01-08",
    runtime: 156,
    genre: ["Surrealist", "Experimental"]
  },
  {
    id: "11",
    title: "Whispers",
    year: 2023,
    director: "Thomas Klein",
    rating: 3.5,
    poster: "https://images.unsplash.com/photo-1763067402271-67cbb839d6a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wbGF0aXZlJTIwYXJ0aXN0aWMlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzA5NjM2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1763067402271-67cbb839d6a4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb250ZW1wbGF0aXZlJTIwYXJ0aXN0aWMlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzA5NjM2MTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "Klein's introspective character study benefits from a remarkable central performance. The film's quiet intensity builds slowly, revealing layers of complexity beneath its calm surface.",
    watchedDate: "2026-01-05",
    runtime: 94,
    genre: ["Drama", "Character Study"]
  },
  {
    id: "12",
    title: "Reverie",
    year: 2025,
    director: "Isabelle Laurent",
    rating: 4.5,
    poster: "https://images.unsplash.com/photo-1762656668760-aaa1e11944c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmVhbCUyMGRyZWFteSUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MDk2MzYxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    backdrop: "https://images.unsplash.com/photo-1762656668760-aaa1e11944c2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxldGhlcmVhbCUyMGRyZWFteSUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MDk2MzYxM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    review: "Laurent crafts a dreamlike narrative that blurs the boundaries between memory and imagination. The ethereal cinematography perfectly complements the film's exploration of consciousness and identity.",
    watchedDate: "2026-01-01",
    runtime: 118,
    genre: ["Fantasy", "Drama"]
  }
];
