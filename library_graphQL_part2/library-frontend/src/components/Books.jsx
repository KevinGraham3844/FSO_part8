import { useState } from 'react'
import GenreList from './GenreList'
import AllBooks from './AllBooks'


const Books = ({ buttonStyle, setPreference, result }) => {
  const [genre, setGenre] = useState(null)
  const [page, setPage] = useState("")

  console.log('this is the result of the query', result)
  
  if (result.loading) {
    return <div>loading...</div>
  }

  const books = result.data.allBooks
  const genres = []
  books.map(book => {
    for (let i = 0; i < book.genres.length; i++) {
      if(!genres.includes(book.genres[i])) {
        genres.push(book.genres[i])
      }
    }
  })
  
  const applyGenre = (genre) => {
    setGenre(genre)
    setPage("genres")
  }

  const applyFavorite = () => {
    console.log(genre)
    localStorage.setItem('user-preference', genre)
    setPreference(genre)
  }

  if (page === "genres") {
    return (
      <div>
      <GenreList genre={genre} />
      <button style={buttonStyle} onClick={() => setPage("")}>all genres</button>
      <button style={buttonStyle} onClick={() => applyFavorite()}>set to favorite</button>
      </div>
    )
  }
  return (
    <div>
      <h2>books</h2>
      <AllBooks books={books}/>
      {genres.map((genre) => (
        <button key={genre} style={buttonStyle} onClick={() => applyGenre(genre)}>
          {genre}
        </button>
      ))}
    </div>
  )
}

export default Books
