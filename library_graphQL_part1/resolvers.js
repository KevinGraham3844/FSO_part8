const { PubSub } = require('graphql-subscriptions')
const { GraphQLError } = require('graphql')
const { v1: uuid } = require('uuid')
const jwt = require('jsonwebtoken')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const pubsub = new PubSub()

const resolvers = {
    Query: {
      bookCount: () => Book.collection.countDocuments(),
      authorCount: () => Author.collection.countDocuments(),
      allBooks: async (root, args) => {
        const allBooks = await Book.find({}).populate('author', { name: 1, born: 1 })
        console.log(allBooks)
          if(!args.author && !args.genre) {
              return await Book.find({}).populate('author', { name: 1, born: 1 })
          } else if (!args.genre) {
              return allBooks.filter(book => book.author.name === args.author)
          } else if (!args.author) {
              return await Book.find({ 'genres': args.genre }).populate('author', { name: 1, born: 1 })
          }
          const specificGenre = await Book.find({ 'genres': args.genre }).populate('author', { name: 1, born: 1 })
          return specificGenre.filter(book => book.author.name === args.author)  
      },
      allAuthors: async () => await Author.find({}),
      me: (root, args, context) => {
        return context.currentUser
      }
    },
    Author: {
      bookCount: async (root) => {
          /*
          const allBooks = await Book.find({}).populate('author', { name: 1, born: 1 })
          console.log('book.find')
          return allBooks.filter(book => book.author.name === root.name).length
          */
         return root.booksWritten.length
      }
    },
    Mutation: {
      addBook: async (root, args, context) => {
        const currentUser = context.currentUser
  
        if (!currentUser) {
          throw new GraphQLError('not authenticated', {
            extensions: {
              code: 'BAD_USER_INPUT',
            }
          })
        }
  
        const author = await Author.findOne({ name: args.author })
        try {
          if (author === null) {
            const newAuthor = new Author({
              name: args.author,
              born: null,
              booksWritten: [args.title]
            })
            await newAuthor.save()
            const book = new Book({
              ...args,
              author: newAuthor._id
            })
            await book.save()
            const updatedBook = book.populate('author', { name: 1, born: 1 })
            pubsub.publish('BOOK_ADDED', { bookAdded: updatedBook })
            return updatedBook
          } else {
            const book = new Book({
              ...args,
              author: author._id
            })
            await book.save()
            author.booksWritten.push(args.title)
            await author.save()
            const updatedBook = book.populate('author', { name: 1, born: 1 })
            pubsub.publish('BOOK_ADDED', { bookAdded: updatedBook })
            return updatedBook
          }
        } catch (error) {
          throw new GraphQLError('Adding a new book failed,', {
            extensions: {
              code: 'BAD_USER_INPUT', 
              invalidArgs: args.name,
              error
            }
          })
        }
      },
      editAuthor: async (root, args, context) => {
          const currentUser = context.currentUser
  
          if(!currentUser) {
            throw new GraphQLError('not authenticated', {
              extensions: {
                code: 'BAD_USER_INPUT'
              }
            })
          }
          const author = await Author.findOne({ name: args.name })
          console.log(author)
          if (!author) {
              return null
          }
          author.born = args.setBornTo
          await author.save()
          return author
          
      },
      addAuthor: async (root, args) => {
        const author = new Author({ ...args })
        try {
          await author.save()
          return author
        } catch (error) {
          throw new GraphQLError('could not save new author', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: args.name,
              error
            }
          })
        }
      },
      createUser: async (root, args) => {
        const user = new User({ username: args.username })
  
        return user.save()
          .catch(error => {
            throw new GraphQLError('creating the user failed', {
              extensions: {
                code: 'BAD_USER_INPUT',
                invalidArgs: args.username,
                error
              }
            })
          })
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
  
        if ( !user || args.password !== 'monkey' ) {
          throw new GraphQLError('wrong credentials', {
            extensions: {
              code: 'BAD_USER_INPUT'
            }
          })
        }
  
        const userForToken = {
          username: user.username,
          id: user._id,
        }
  
        return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
      },
    },
    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
        },
    }
  }

  module.exports = resolvers