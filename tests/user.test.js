import "cross-fetch/polyfill"
import ApolloBoost, { gql } from "apollo-boost"

import prisma from "../src/prisma"
import seedDatabase from "./utils/seedDatabase"

const client = new ApolloBoost({
  uri: "http://localhost:4000"
})

beforeEach(seedDatabase)

test("should create a new user", async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: {
          name: "Umais Mir"
          email: "umais@example.com"
          password: "password100"
        }
      ) {
        token
        user {
          id
        }
      }
    }
  `

  const { data } = await client.mutate({
    mutation: createUser
  })

  const userExists = await prisma.exists.User({
    id: data.createUser.user.id
  })

  expect(userExists).toBe(true)
})

test("should not login with bad credentials", async () => {
  const login = gql`
    mutation {
      login(
        data: { email: "jen@example.com", password: "letsseeifthisworks" }
      ) {
        token
      }
    }
  `

  await expect(client.mutate({ mutation: login })).rejects.toThrow()
})

test("should not sign up with a password less than 8 chars", async () => {
  const createUser = gql`
    mutation {
      createUser(
        data: { name: "Joe", email: "joe@example.com", password: "2short" }
      ) {
        token
      }
    }
  `

  await expect(client.mutate({ mutation: createUser })).rejects.toThrow()
})
