
import mongoose from "mongoose";

const MovieSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true },
    overview: { type: String, required: true },

    // Store the complete image URL returned by your API
    poster_path: { type: String, required: true },
    backdrop_path: { type: String, default: "" },

    release_date: { type: String, required: true },
    original_language: { type: String, default: "" },
    tagline: { type: String, default: "" },

    // Flexible because API response structures can differ
    genres: { type: [mongoose.Schema.Types.Mixed], require:true },
    casts: { type: [mongoose.Schema.Types.Mixed], require: true },

    vote_average: { type: Number,required:true  },
    runtime: { type: Number, required: true },
  },
  { timestamps: true }
);

const Movie = mongoose.model("Movie", MovieSchema);

export default Movie;
