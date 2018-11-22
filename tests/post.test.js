import "cross-fetch/polyfill"
import { gql } from "apollo-boost"

import prisma from "../src/prisma"
import getClient from "./utils/getClient"
import seedDatabase, { userOne, postOne, postTwo } from "./utils/seedDatabase"

import {
  getPosts,
  myPosts,
  updatePost,
  createPost,
  deletePost,
  subscribeToPosts
} from "./utils/operations"

const client = getClient()

beforeEach(seedDatabase)

test("should expose only published posts", async () => {
  const response = await client.query({ query: getPosts })

  expect(response.data.posts.length).toBe(1)
  expect(response.data.posts[0].published).toBe(true)
})

test("should fetch users post", async () => {
  const client = getClient(userOne.jwt)

  const { data } = await client.query({ query: myPosts })

  expect(data.myPosts.length).toBe(2)
})

test("should be able to update own post", async () => {
  const client = getClient(userOne.jwt)

  const variables = {
    id: postOne.post.id,
    data: {
      published: false
    }
  }

  const { data } = await client.mutate({ mutation: updatePost, variables })
  const exists = await prisma.exists.Post({
    id: postOne.post.id,
    published: false
  })

  expect(data.updatePost.published).toBe(false)
  expect(exists).toBe(true)
})

test("should be able to create post", async () => {
  const client = getClient(userOne.jwt)

  const variables = {
    data: {
      title: "JavaScript in 2018",
      body: "...",
      published: true
    }
  }

  const { data } = await client.mutate({ mutation: createPost, variables })
  const exists = await prisma.exists.Post({
    id: data.createPost.id,
    ...variables.data
  })

  expect(data.createPost.title).toBe(variables.data.title)
  expect(exists).toBe(true)
})

test("should be able to delete own post", async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    id: postTwo.post.id
  }

  await client.mutate({ mutation: deletePost, variables })

  const exists = await prisma.exists.Post({ id: postTwo.post.id })

  expect(exists).toBe(false)
})

test("should subscribe to posts", async done => {
  const data = {
    title: "Updated Title!"
  }

  client.subscribe({ query: subscribeToPosts }).subscribe({
    next(response) {
      expect(response.data.post.mutation).toBe("UPDATED")
      expect(response.data.post.node.id).toBe(postOne.post.id)
      expect(response.data.post.node.title).toBe(data.title)
      done()
    }
  })

  await prisma.mutation.updatePost({
    where: { id: postOne.post.id },
    data
  })
})
