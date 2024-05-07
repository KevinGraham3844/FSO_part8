import { useQuery } from '@apollo/client'
import { GENRES } from '../queries'


const GenreList = ({ genre }) => {
    const genreList = useQuery(GENRES, {
        variables: { genre }
    })
    console.log(genre)
    console.log(genreList)
    if (genreList.data === undefined) {
        return null
    }

    return (
        <div>
            in genre <b>{genre}</b>
            <div>
            <table>
                    <tbody>
                        <tr>
                            <th></th>
                            <th>author</th>
                            <th>published</th>
                        </tr>
                        {genreList.data.allBooks.map((book) => (
                            <tr key={book.title}>
                                <td>{book.title}</td>
                                <td>{book.author.name}</td>
                                <td>{book.published}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

}


export default GenreList

