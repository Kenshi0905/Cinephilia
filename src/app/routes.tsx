import { createBrowserRouter } from "react-router-dom";
import { MovieGrid } from "./components/MovieGrid";
import { MovieDetail } from "./components/MovieDetail";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: MovieGrid },
      { path: "movie/:id", Component: MovieDetail },
    ],
  },
]);
