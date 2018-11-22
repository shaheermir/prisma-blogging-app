import "cross-fetch/polyfill"

import prisma from "../src/prisma"
import getClient from "./utils/getClient"
import seedDatabase, { userOne } from "./utils/seedDatabase"
import { createUser, getUsers, getMyProfile, login } from "./utils/operations"

const client = getClient()

beforeEach(seedDatabase)

test("should create a new user", async () => {
  const variables = {
    data: {
      name: "Umais Mir",
      email: "umais@example.com",
      password: "password100"
    }
  }

  const { data } = await client.mutate({
    mutation: createUser,
    variables
  })

  const userExists = await prisma.exists.User({
    id: data.createUser.user.id
  })

  expect(userExists).toBe(true)
})

test("Should expose public author profiles", async () => {
  const response = await client.query({ query: getUsers })

  expect(response.data.users.length).toBe(2)
  expect(response.data.users[0].email).toBe(null)
  expect(response.data.users[0].name).toBe("Jen")
})

test("should not login with bad credentials", async () => {
  const variables = {
    data: { email: "jen@example.com", password: "letsseeifthisworks" }
  }

  await expect(client.mutate({ mutation: login, variables })).rejects.toThrow()
})

test("should not sign up with a password less than 8 chars", async () => {
  const variables = {
    data: {
      name: "Joe",
      email: "joe@example.com",
      password: "2short"
    }
  }

  await expect(
    client.mutate({ mutation: createUser, variables })
  ).rejects.toThrow()
})

test("should fetch user profile", async () => {
  const client = getClient(userOne.jwt)

  const response = await client.query({ query: getMyProfile })

  expect(response.data.me.id).toBe(userOne.user.id)
  expect(response.data.me.name).toBe(userOne.user.name)
  expect(response.data.me.email).toBe(userOne.user.email)
})
