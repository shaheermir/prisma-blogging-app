import "cross-fetch/polyfill"
import ApolloBoost, { gql } from "apollo-boost"

import seedDatabase from "./utils/seedDatabase"

const client = new ApolloBoost({
  uri: "http://localhost:4000"
})

beforeEach(seedDatabase)

test("Should expose public author profiles", async () => {
  const getUsers = gql`
    query {
      users {
        id
        name
        email
      }
    }
  `
  const response = await client.query({ query: getUsers })

  expect(response.data.users.length).toBe(1)
  expect(response.data.users[0].email).toBe(null)
  expect(response.data.users[0].name).toBe("Jen")
})

test("should expose only published posts", async () => {
  const getPosts = gql`
    query {
      posts {
        id
        title
        body
        published
      }
    }
  `

  const response = await client.query({ query: getPosts })

  expect(response.data.posts.length).toBe(1)
  expect(response.data.posts[0].published).toBe(true)
})
