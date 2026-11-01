
import axios from "axios";
import Movie from "../models/Movie.js";
import Show from "../models/Show.js";

const API_URL = "https://api.watchmode.com/v1";
const NOW_PLAYING_CACHE_TTL = 5 * 60 * 1000;
let nowPlayingMoviesCache;
let nowPlayingMoviesRequest;

const delay = (milliseconds) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));

const isRetryableWatchmodeError = (error) => {
    const message = String(
        error.response?.data?.errorMessage || error.message || ""
    );

    return (
        error.response?.status === 429 ||
        error.response?.status >= 500 ||
        message.toLowerCase().includes("too many concurrent requests")
    );
};

const fetchWatchmodeDetails = async (id, apiKey) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
            const { data } = await axios.get(
                `${API_URL}/title/${id}/details/`,
                {
                    params: { apiKey },
                    timeout: 15000
                }
            );

            return data;
        } catch (error) {
            if (attempt === 2 || !isRetryableWatchmodeError(error)) {
                throw error;
            }

            const retryAfter = Number(error.response?.headers?.["retry-after"]);
            const backoff = 500 * (2 ** attempt);
            await delay(
                Number.isFinite(retryAfter) && retryAfter > 0
                    ? retryAfter * 1000
                    : backoff
            );
        }
    }
};

const getCastMembers = (data) => {
    if (Array.isArray(data)) {
        return data;
    }

    return data?.cast || data?.cast_crew || data?.castCrew || data?.results || [];
};

const fetchWatchmodeCast = async (id, apiKey) => {
    const { data } = await axios.get(
        `${API_URL}/title/${id}/cast-crew/`,
        {
            params: { apiKey },
            timeout: 15000
        }
    );

    return getCastMembers(data);
};

export const getNowPlayingMovies = async (req, res) => {
    try {
        const apiKey = process.env.WATCHMODE_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                message: "WATCHMODE_API_KEY is missing"
            });
        }

        if (
            nowPlayingMoviesCache &&
            nowPlayingMoviesCache.expiresAt > Date.now()
        ) {
            return res.json({
                success: true,
                movies: nowPlayingMoviesCache.movies
            });
        }

        if (!nowPlayingMoviesRequest) {
            nowPlayingMoviesRequest = (async () => {
                const { data } = await axios.get(
                    `${API_URL}/list-titles/`,
                    {
                        params: {
                            apiKey,
                            types: "movie",
                            limit: 10
                        },
                        timeout: 15000
                    }
                );

                const titles = data.titles || [];
                const movies = [];

                for (const item of titles) {
                    try {
                        const details = await fetchWatchmodeDetails(
                            item.id,
                            apiKey
                        );

                        movies.push({
                            _id: String(item.id),
                            title: details.title || item.title || "",
                            overview: details.plot_overview || "",
                            poster_path: details.poster || "",
                            backdrop_path: details.backdrop || "",
                            release_date:
                                details.release_date ||
                                (details.year
                                    ? String(details.year)
                                    : item.year
                                        ? String(item.year)
                                        : ""),
                            original_language:
                                details.original_language || "",
                            tagline: details.tagline || "",
                            genres: details.genre_names || [],
                            casts: [],
                            vote_average: Number(details.user_rating) || 0,
                            runtime: Number(details.runtime_minutes) || 0
                        });
                    } catch (error) {
                        console.error(
                            `Failed to fetch ${item.title}:`,
                            error.response?.data || error.message
                        );

                        movies.push({
                            _id: String(item.id),
                            title: item.title || "",
                            overview: "",
                            poster_path: "",
                            backdrop_path: "",
                            release_date: item.year
                                ? String(item.year)
                                : "",
                            original_language: "",
                            tagline: "",
                            genres: [],
                            casts: [],
                            vote_average: 0,
                            runtime: 0
                        });
                    }
                }

                return movies;
            })();
        }

        try {
            const movies = await nowPlayingMoviesRequest;
            nowPlayingMoviesCache = {
                movies,
                expiresAt: Date.now() + NOW_PLAYING_CACHE_TTL
            };

            return res.json({
                success: true,
                movies
            });
        } finally {
            nowPlayingMoviesRequest = undefined;
        }
    } catch (error) {
        console.error(
            "Watchmode API error:",
            error.response?.data || error.message
        );

        return res.status(error.response?.status || 500).json({
            success: false,
            message: "Failed to fetch movies from Watchmode"
        });
    }
};

// api to add a  new show to the database
export const addShow =async(req,res)=> {
      
    try{
        const {movieId,showsInput,showPrice}=req.body;
        let movie = await Movie.findById(movieId);
        if(!movie){
        const [movieDetailsResponse, movieCastResponse]=await Promise.all([
            axios.get(
                `https://api.watchmode.com/v1/title/${movieId}/details/`,
                {
                    params: {
                        apiKey: process.env.WATCHMODE_API_KEY
                    }
                }
            ),
             axios.get(
                `https://api.watchmode.com/v1/title/${movieId}/cast-crew/`,
                {
                    params: {
                        apiKey: process.env.WATCHMODE_API_KEY
                    }
                }
            )
        ])
        const movieApiData = movieDetailsResponse.data ;

        // Create the movie object
            const movieDetails = {
                _id: String(movieId),
                title: movieApiData.title || "",
                overview: movieApiData.plot_overview || "",
                poster_path: movieApiData.poster || "",
                backdrop_path: movieApiData.backdrop || "",
                genres: movieApiData.genre_names || [],
                casts: getCastMembers(movieCastResponse.data),
                release_date: movieApiData.release_date ||
                    (movieApiData.year
                        ? String(movieApiData.year)
                        : ""),
                original_language: movieApiData.original_language || "",
                tagline: movieApiData.tagline || "",
                vote_average: Number(movieApiData.user_rating) || 0,
                runtime: Number(movieApiData.runtime_minutes) || 0
            };
            movie = await Movie.create(movieDetails);

        }

        const showsToCreate = [];
        showsInput.forEach(show => {
            const showsDate = show.date;
            show.time.forEach(time => {
                const dateTimeString = `${showsDate}T${time}`;
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(dateTimeString),
                    showPrice,
                    occupiedSeats: {}
                });
            });
        });

        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }

        res.json({
            success: true,
            message: 'Show added successfully.'
        });

    }catch(error){
        console.error(error);
        res.json({
            success: false,
             message:error.message
        })
    }

}

// api to get all shows from the database
export const getShows = async (req,res) =>{
    try{
        const shows = await Show.find({showDateTime:{$gte: new Date()}}).populate('movie').sort({showDateTime:1});

        const uniqueMovies = new Map();
        shows.forEach((show) => {
            const movie = show.movie;
            if (!movie) return;

            const movieId = String(movie._id || movie);
            if (!uniqueMovies.has(movieId)) {
                uniqueMovies.set(movieId, movie);
            }
        });

        res.json({
            success :true ,
            shows : Array.from(uniqueMovies.values())
        })

    }catch(error){
        console.error(error)
        res.json({
            success: false,
             message:error.message
        })
    }
}

// api to get a single show from database
export const getShow = async (req,res) =>{
    try{

        const {movieId}= req.params;
        const shows = await Show.find({movie:movieId,showDateTime : {$gte : new Date()}});
        const movie = await Movie.findById(movieId);
        if (movie && (!Array.isArray(movie.casts) || movie.casts.length === 0)) {
            const apiKey = process.env.WATCHMODE_API_KEY;
            if (apiKey) {
                try {
                    movie.casts = await fetchWatchmodeCast(movieId, apiKey);
                    await movie.save();
                } catch (error) {
                    console.error(
                        `Failed to fetch cast for ${movie.title}:`,
                        error.response?.data || error.message
                    );
                }
            }
        }
        const dateTime = {};
        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]){
                dateTime[date]=[]
            }
            dateTime[date].push({
                time: show.showDateTime,showId:show._id
            })
        }    )
        res.json({
            success:true ,
            movie,dateTime
        })

    }catch(error){
        console.error(error)
        res.json({
            success: false,
             message:error.message
        })
    }
}