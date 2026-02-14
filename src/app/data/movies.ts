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

// Start with an empty list; real movies come from Letterboxd exports/RSS at runtime.
export const movies: Movie[] = [];
