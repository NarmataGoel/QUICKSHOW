import { StarIcon } from 'lucide-react';
import React from 'react'
import { useNavigate } from 'react-router-dom';
import timeFormat from '../lib/timeFormat';


const MovieCard = ({ movie }) => {
    const navigate=useNavigate()
    const genreNames = Array.isArray(movie?.genres)
      ? movie.genres
          .map(genre => typeof genre === 'string' ? genre : genre?.name)
          .filter(Boolean)
          .slice(0, 2)
      : []
    const movieId = movie?._id || movie?.id;
    const releaseYear = movie?.release_date
      ? new Date(movie.release_date).getFullYear()
      : 'TBA';
    const rating = typeof movie?.vote_average === 'number' ? movie.vote_average.toFixed(1) : 'N/A';

  return (
   <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66">

    <img
      onClick={() => {
        if (movieId) {
          navigate(`/movies/${movieId}`);
          scrollTo(0, 0);
        }
      }}
      src={movie?.backdrop_path || movie?.poster_path || ''}
      alt={movie?.title || 'Movie poster'}
      className="rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer"
    />

    <p className="font-semibold mt-2 truncate">
      {movie?.title || 'Untitled movie'}
    </p>

    <p className="text-sm text-gray-400 mt-2">
      {releaseYear} •
      {genreNames.length > 0 ? genreNames.join(' | ') : 'General'}
      {movie?.runtime ? ` • ${timeFormat(movie.runtime)}` : ''}
    </p>
    <div className="flex items-center justify-between mt-4 pb-3">
  <button
    onClick={() => {
      if (movieId) {
        navigate(`/movies/${movieId}`);
        scrollTo(0, 0);
      }
    }}
    className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull
     transition rounded-full font-medium cursor-pointer"
  >
    Buy Tickets
  </button>

  <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
    <StarIcon className="w-4 h-4 text-primary fill-primary" />
    {rating}
  </p>
</div>
  </div>
  )
}

export default MovieCard
