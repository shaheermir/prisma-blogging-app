import "cross-fetch/polyfill"
import prisma from "../src/prisma"
import { gql } from "apollo-boost"

import getClient from "./utils/getClient"
import { deleteComment } from "./utils/operations"

import seedDatabase, {
  userOne,
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
