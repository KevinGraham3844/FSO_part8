/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'
import { useMutation } from '@apollo/client'


const Authors = () => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const result = useQuery(ALL_AUTHORS)
  const [ changeYear ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS }]
  })

  useEffect(() => {
    
    if (result.data.allAuthors.length !== 0) {
      setName(result.data.allAuthors[0].name)
    }
  }, [result.data])
  
  const submitChange = (event) => {
    event.preventDefault()
    console.log(name, born)
    
    changeYear({ variables: { name: name, setBornTo: born }})

    setName('')
    setBorn('')
  }

  if (result.loading) {
    return <div>loading...</div>
  }
  console.log(result)
  const authors = result.data.allAuthors
  
  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <h2>Set Birthyear</h2>
        <form onSubmit={submitChange}>
          <div>
            <select name="authors List" onChange={({ target }) => setName(target.value)}>
              {authors.map((author) => (
                <option key={author.name} value={author.name}>{author.name}</option>
              ))}
            </select>
            
          </div>
          <div>
            born
            <input
              type="number"
              value={born}
              onChange={({ target }) => setBorn(target.valueAsNumber)} 
            />
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    </div>
  )
}

export default Authors
