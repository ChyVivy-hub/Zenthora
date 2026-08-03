const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const TMDB = 'https://api.themoviedb.org/3'

async function fetchJSON(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed')
  return res.json()
}

function price(rating) {
  const rate = parseFloat(rating) || 5
  const basePrice = rate * 1500
  const min = 2000
  const max = 15000
  const final = Math.max(min, Math.min(max, Math.round(basePrice)))
  return final.toString()
}

function safeId(p) {
  return p + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
}

export async function fetchTrendingMovies() {
  const data = await fetchJSON(TMDB + '/trending/movie/week?api_key=' + TMDB_KEY)
  return data.results.slice(0, 10).map(m => ({
    id: 'movie-' + m.id, tmdbId: m.id, title: m.title, price: price(m.vote_average), currency: 'NGN', category: 'Movies',
    rating: m.vote_average, releaseYear: new Date(m.release_date).getFullYear(),
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    backdrop: m.backdrop_path ? 'https://image.tmdb.org/t/p/original' + m.backdrop_path : null,
    description: m.overview || '', stock: 20, publisher: 'Movie Studio', country: 'International'
  }))
}

export async function fetchPopularMovies() {
  const data = await fetchJSON(TMDB + '/movie/popular?api_key=' + TMDB_KEY)
  return data.results.slice(0, 10).map(m => ({
    id: 'movie-pop-' + m.id, tmdbId: m.id, title: m.title, price: price(m.vote_average), currency: 'NGN', category: 'Movies',
    rating: m.vote_average, releaseYear: new Date(m.release_date).getFullYear(),
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    description: m.overview || '', stock: 20, publisher: 'Movie Studio', country: 'International'
  }))
}

export async function fetchBooks() {
  const data = await fetchJSON('https://openlibrary.org/search.json?q=popular&limit=10')
  return data.docs.slice(0, 10).map(b => ({
    id: safeId('book'), title: b.title || 'Untitled', price: price(Math.random() * 1.5 + 3.5), currency: 'NGN', category: 'Books',
    rating: (Math.random() * 1.5 + 3.5).toFixed(1), releaseYear: b.first_publish_year || 2026,
    image: b.cover_i ? 'https://covers.openlibrary.org/b/id/' + b.cover_i + '-L.jpg' : null,
    description: b.author_name ? 'By ' + b.author_name[0] : '', stock: 15,
    publisher: b.publisher?.[0] || 'Publisher', author: b.author_name?.[0] || 'Unknown', country: 'International'
  }))
}

export async function fetchManga() {
  const data = await fetchJSON(TMDB + '/discover/movie?api_key=' + TMDB_KEY + '&with_genres=16&sort_by=popularity.desc')
  return data.results.slice(0, 10).map(m => ({
    id: 'manga-' + m.id, tmdbId: m.id, title: m.title, price: price(m.vote_average), currency: 'NGN', category: 'Manga',
    rating: m.vote_average, releaseYear: new Date(m.release_date).getFullYear(),
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    description: m.overview || '', stock: 15, publisher: 'Anime Studio', country: 'Japan'
  }))
}

export async function fetchComics() {
  const data = await fetchJSON(TMDB + '/discover/movie?api_key=' + TMDB_KEY + '&with_genres=28&sort_by=popularity.desc')
  return data.results.slice(0, 10).map(m => ({
    id: 'comic-' + m.id, tmdbId: m.id, title: m.title, price: price(m.vote_average), currency: 'NGN', category: 'Comics',
    rating: m.vote_average, releaseYear: new Date(m.release_date).getFullYear(),
    image: m.poster_path ? 'https://image.tmdb.org/t/p/w500' + m.poster_path : null,
    description: m.overview || '', stock: 15, publisher: 'Action Studio', country: 'United States'
  }))
}

export async function fetchTrailer(movieId) {
  try {
    const data = await fetchJSON(TMDB + '/movie/' + movieId + '/videos?api_key=' + TMDB_KEY)
    const t = data.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    return t ? t.key : null
  } catch { return null }
}

export async function fetchAllProducts() {
  const results = await Promise.all([
    fetchTrendingMovies(), fetchPopularMovies(), fetchBooks(), fetchManga(), fetchComics()
  ])
  const all = results.flat()
  const seen = new Set()
  const unique = all.filter(p => {
    const key = p.title?.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  console.log('Total products:', unique.length)
  return unique
}