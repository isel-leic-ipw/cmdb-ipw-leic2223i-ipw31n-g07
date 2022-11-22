import error from "../errors.mjs";
import debugInit from 'debug';



export default function (moviesData) {
    // Validate arguments
    if (!moviesData) {
        throw error.INVALID_PARAMETER('moviesData')
    }

    const debug = debugInit("cmdb:services:movies")
    const MAX_LIMIT = 250

    return {
        getTopMovies: handleMovieRequest(getTopMoviesInternal),
        getMovies: handleMovieRequest(getMoviesInternal),
        getMovie,
    }

    async function getTopMoviesInternal(offset = 0, limit = 250) {
        debug(`getTopMoviesInternal with offset ${offset} and limit ${limit}`)
        const movies = await moviesData.getTopMovies(offset, limit)
        //debug(`Found %O`, movies)
        if (!movies) {
            debug(`No movies found`)
            throw error.UNKNOWN("No movies found")
        }
        return movies
    }

    async function getMoviesInternal(offset = 0, limit = MAX_LIMIT, search_text) {
        debug(`getMoviesInternal with ${offset} limit ${limit} and search: ${search_text}`)
        if (!search_text)
            throw error.INVALID_PARAMETER("search string is required")

        return await moviesData.getMovies(offset, limit, search_text)
    }

    async function getMovie(movieId) {
        debug(`getMovie with movieId: ${movieId}`)
        if (!movieId)
            throw error.INVALID_PARAMETER("movieId is required")

        return await moviesData.getMoviebyId(movieId);
    }

    function handleMovieRequest(action) {
        return async function (offset = 0, limit = MAX_LIMIT, search_text) {
            offset = Number(offset)
            limit = Number(limit)
            if (isNaN(offset) || isNaN(limit)) {
                debug(`Invalid offset or limit: ${offset} - ${limit}`)
                throw error.INVALID_PARAMETER("Offset and limit must be numbers")
            }
            if (offset < 0 || limit < 0) {
                debug(`Invalid offset or limit: ${offset} - ${limit}`)
                throw error.INVALID_PARAMETER("Offset and limit must be positive")
            }
            //if (limit > MAX_LIMIT || offset + limit > MAX_LIMIT) {
            if (limit > MAX_LIMIT) {
                throw error.INVALID_PARAMETER(`Limit must be less than or equal to ${MAX_LIMIT}`)
            }
            debug(`Running action: ${action.name} search_text: ${search_text} offset: ${offset} limit: ${limit}`)
            const movies = await action(offset, limit, search_text)
            return movies
        }
    }
}
