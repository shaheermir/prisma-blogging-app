import "cross-fetch/polyfill"
import prisma from "../src/prisma"

import getClient from "./utils/getClient"
import { deleteComment, subscribeToComments } from "./utils/operations"

import seedDatabase, {
  userOne,
  postOne,
  commentOne,
  commentTwo
} from "./utils/seedDatabase"

const client = getClient()

beforeEach(seedDatabase)

test("should delete own comment", async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    id: commentTwo.comment.id
  }

  await client.mutate({ mutation: deleteComment, variables })
  const comments = await prisma.query.comments()

  expect(comments.length).toBe(1)
})

test("should not delete be able to delete other users comment", async () => {
  const client = getClient(userOne.jwt)
  const variables = {
    id: commentOne.comment.id
  }

  await expect(
    client.mutate({ mutation: deleteComment, variables })
  ).rejects.toThrow()
})

test("should subscribe to comments for a post", async done => {
  const variables = {
    postId: postOne.post.id
  }

  client.subscribe({ query: subscribeToComments, variables }).subscribe({
    next(response) {
      expect(response.data.comment.mutation).toBe("DELETED")
      done()
    }
  })

  await prisma.mutation.deleteComment({ where: { id: commentOne.comment.id } })
})
