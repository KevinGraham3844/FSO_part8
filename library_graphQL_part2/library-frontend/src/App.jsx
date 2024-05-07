/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect } from 'react'
import { useSubscription, useQuery } from '@apollo/client'
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Notification from './components/Notification';
import Recommendations from './components/Recommendations';
import LoginForm from './components/LoginForm';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom'
import { ALL_BOOKS, BOOK_ADDED } from './queries';


const padding = {
  padding: "2px 6px 2px 6px",
  font: "bold 11px Arial", 
  textDecoration: "none",
  backgroundColor: "#EEEEEE",
  borderTop: "1px solid #CCCCCC",
  borderRight: "1px solid #333333",
  borderBottom: "1px solid #333333",
  borderLeft: "1px solid #CCCCCC",
  fontColor: "purple"
}

export const updateCache = (cache, query, addedBook) => {
  const uniqByName = (a) => {
      let seen = new Set()
      return a.filter((item) => {
          let k = item.title
          console.log(k)
          return seen.has(k) ? false : seen.add(k)
      })
  }

  cache.updateQuery(query, ({ allBooks }) => {
      return {
          allBooks: uniqByName(allBooks.concat(addedBook))
      }
  })
}


const App = () => {
  const [token, setToken] = useState(null)
  const [preference, setPreference] = useState(null)
  const [message, setMessage] = useState(null)

  const booksResult = useQuery(ALL_BOOKS)



  useSubscription(BOOK_ADDED, {
    onData: ({ data, client }) => {
      console.log('the subscription works, here is the data: ', data)
      const addedBook = data.data.bookAdded
      setMessage(`${addedBook.title} by ${addedBook.author.name} has been added`)
      setTimeout(() => {
        setMessage(null)
      }, 10000)  
      updateCache(client.cache, { query: ALL_BOOKS }, addedBook)     
    }
  })

  useEffect(() => {
    const loggedUser = localStorage.getItem('library-user-token')
    const userPreference = localStorage.getItem('user-preference')
    if (loggedUser) {
      setToken(loggedUser)
      setPreference(userPreference)
    }
  }, [])

  const logout = () => {
    setToken(null)
    localStorage.clear()
  }

  return (
    <div>
      <Router>
        <div>
          <Link style={padding} to="/">home</Link>
          <Link style={padding} to="/authors">authors</Link>
          <Link style={padding} to="/books">books</Link>
          {token
            ? <div>
              <button style={padding} onClick={logout}>logout</button>
              <Link style={padding} to="/add">add book</Link>
              <Link style={padding} to="/recommendations">recommend</Link>
              </div>
            : <Link style={padding} to="/login">login</Link>
          }
        </div>
        <div>
          <Notification message={message} />
        </div>
        <div>
          <Routes>
            <Route path="/" element={<h2>Library App</h2>} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/books" element={<Books buttonStyle={padding} setPreference={setPreference} result={booksResult}/>} />
            <Route path="/add" element={<NewBook />} />
            <Route path="/login" element={<LoginForm setToken={setToken}/>} />
            <Route path="/recommendations" element={<Recommendations genre={preference}/>} />
          </Routes>
        </div>
      </Router>
    </div>
  );
};

export default App;

