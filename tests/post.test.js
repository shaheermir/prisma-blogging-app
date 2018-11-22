import "cross-fetch/polyfill"
import { gql } from "apollo-boost"

import prisma from "../src/prisma"
import getClient from "./utils/getClient"
import seedDatabase, { userOne, postOne, postTwo } from "./utils/seedDatabase"

const client = getClient()

beforeEach(seedDatabase)

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

test("should fetch users post", async () => {
  const client = getClient(userOne.jwt)
  const myPosts = gql`
    query {
      myPosts {
        id
        title
        body
        published
      }
    }
  `

  const { data } = await client.query({ query: myPosts })

  expect(data.myPosts.length).toBe(2)
})

test("should be able to update own post", async () => {
  const client = getClient(userOne.jwt)

  const updatePost = gql`
    mutation {
      updatePost(
        id: "${postOne.post.id}",
        data: {
          published: false
        }
      ) {
        id
        title
        body
        published
      }
    }
  `

  const { data } = await client.mutate({ mutation: updatePost })
  const exists = await prisma.exists.Post({
    id: postOne.post.id,
    published: false
  })

  expect(data.updatePost.published).toBe(false)
  expect(exists).toBe(true)
})

test("should be able to create post", async () => {
  const client = getClient(userOne.jwt)
  const newPost = {
    title: "JavaScript in 2018",
    body: "...",
    published: true
  }

  const createPost = gql`
    mutation {
      createPost(
        data: {
          title: "${newPost.title}",
          body: "${newPost.body}",
          published: ${newPost.published}
        }
      ) {
        id
        title
        body
        published
      }
    }
  `

  const { data } = await client.mutate({ mutation: createPost })
  const exists = await prisma.exists.Post({
    id: data.createPost.id,
    ...newPost
  })

  expect(data.createPost.title).toBe(newPost.title)
  expect(exists).toBe(true)
})

test("should be able to delete own post", async () => {
  const client = getClient(userOne.jwt)

  const deletePost = gql`
    mutation {
      deletePost(id: "${postTwo.post.id}") {
        id
        title
        body
        published
      }
    }
  `

  await client.mutate({ mutation: deletePost })

  const exists = await prisma.exists.Post({ id: postTwo.post.id })

  expect(exists).toBe(false)
})
