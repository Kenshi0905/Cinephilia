import { movies } from "../data/movies";
import { MovieCard } from "./MovieCard";

export function MovieGrid() {
  // Calculate positions for circular layout around center
  const getCircularPosition = (index: number, total: number, radius: number, layer: number = 1) => {
    const angle = (index / total) * 2 * Math.PI;
    const x = Math.cos(angle) * radius * layer;
    const y = Math.sin(angle) * radius * layer;
    return { x, y };
  };

  // Distribute movies in concentric circles
  const itemsPerLayer = [8, 12, 16]; // How many items in each circular layer
  let currentIndex = 0;
  const moviePositions = movies.map((movie, index) => {
    // Determine which layer this movie belongs to
    let layer = 0;
    let itemsBeforeLayer = 0;
    let itemsInCurrentLayer = itemsPerLayer[0];
    
    for (let i = 0; i < itemsPerLayer.length; i++) {
      if (index < itemsBeforeLayer + itemsPerLayer[i]) {
        layer = i;
        itemsInCurrentLayer = itemsPerLayer[i];
        currentIndex = index - itemsBeforeLayer;
        break;
      }
      itemsBeforeLayer += itemsPerLayer[i];
    }
    
    // If we've gone past all defined layers, add to outermost layer
    if (layer >= itemsPerLayer.length) {
      layer = itemsPerLayer.length - 1;
      itemsInCurrentLayer = itemsPerLayer[layer];
      currentIndex = index % itemsInCurrentLayer;
    }
    
    const baseRadius = 180; // Base radius in pixels
    const pos = getCircularPosition(currentIndex, itemsInCurrentLayer, baseRadius, layer + 1);
    
    return {
      movie,
      style: {
        position: 'absolute' as const,
        left: '50%',
        top: '50%',
        transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
      }
    };
  });

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 relative overflow-hidden">
      <div className="relative w-full h-[calc(100vh-12rem)] min-h-[800px]">
        
        {/* Centered Logo Block */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 text-center pointer-events-none">
          {/* Top line */}
          <div className="w-[500px] h-[3px] bg-white/90 mb-3 mx-auto" style={{ transform: 'scaleX(1.15)' }}></div>
          
          {/* CINEMA */}
          <h1 
            className="text-white/95 leading-[0.8] mb-1" 
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif', 
              fontWeight: 400, 
              fontSize: '10rem',
              letterSpacing: '-0.05em',
              textTransform: 'uppercase'
            }}
          >
            CINEMA
          </h1>
          
          {/* ARCHIVE */}
          <h1 
            className="text-white/95 leading-[0.8]" 
            style={{ 
              fontFamily: 'Bebas Neue, sans-serif', 
              fontWeight: 400, 
              fontSize: '10rem',
              letterSpacing: '-0.05em',
              textTransform: 'uppercase'
            }}
          >
            ARCHIVE
          </h1>
          
          {/* Bottom line */}
          <div className="w-[500px] h-[3px] bg-white/90 mt-3 mx-auto"></div>
          
          {/* Subtitle */}
          <p className="text-white/40 tracking-wider mt-6 text-sm" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 300 }}>
            {movies.length} films watched
          </p>
        </div>

        {/* Movies arranged in circular pattern */}
        <div className="absolute inset-0">
          {moviePositions.map(({ movie, style }, index) => (
            <div 
              key={movie.id} 
              style={style}
              className="w-[140px] opacity-70 hover:opacity-100 hover:z-50 transition-opacity duration-500 pointer-events-auto"
            >
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}