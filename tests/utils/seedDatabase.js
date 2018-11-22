import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import prisma from "../../src/prisma"

const userOne = {
  input: {
    name: "Jen",
    email: "jen@example.com",
    password: bcrypt.hashSync("Red123456")
  },
  user: undefined
}

const userTwo = {
  input: {
    name: "Ben",
    email: "ben@example.com",
    password: bcrypt.hashSync("Blue@123456")
  },
  user: undefined
}

const postOne = {
  input: {
    title: "My published post",
    body: "",
    published: true
  },
  post: undefined
}

const postTwo = {
  input: {
    title: "My draft post",
    body: "",
    published: false
  },
  post: undefined
}

const commentOne = {
  input: {
    text: "Hey, im user number 2!"
  },
  comment: undefined
}
const commentTwo = {
  input: {
    text: "Hey, im user number 1!"
  },
  comment: undefined
}

const seedDatabase = async () => {
  await prisma.mutation.deleteManyComments()
  await prisma.mutation.deleteManyPosts()
  await prisma.mutation.deleteManyUsers()

  userOne.user = await prisma.mutation.createUser({ data: userOne.input })
  userTwo.user = await prisma.mutation.createUser({ data: userTwo.input })

  userOne.jwt = jwt.sign({ userId: userOne.user.id }, process.env.JWT_SECRET)
  userTwo.jwt = jwt.sign({ userId: userTwo.user.id }, process.env.JWT_SECRET)

  postOne.post = await prisma.mutation.createPost({
    data: {
      ...postOne.input,
      author: {
        connect: { id: userOne.user.id }
      }
    }
  })

  postTwo.post = await prisma.mutation.createPost({
    data: {
      ...postTwo.input,
      author: {
        connect: { id: userOne.user.id }
      }
    }
  })

  commentOne.comment = await prisma.mutation.createComment({
    data: {
      ...commentOne.input,
      author: {
        connect: { id: userTwo.user.id }
      },
      post: {
        connect: { id: postOne.post.id }
      }
    }
  })

  commentTwo.comment = await prisma.mutation.createComment({
    data: {
      ...commentTwo.input,
      author: {
        connect: { id: userOne.user.id }
      },
      post: {
        connect: { id: postOne.post.id }
      }
    }
  })
}

export { userOne, userTwo, postOne, postTwo, commentOne, commentTwo }
export default seedDatabase
