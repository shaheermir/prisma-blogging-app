import bcrypt from "bcryptjs"

import getUserId from "../utils/getUserId"
import hashPassword from "../utils/hashPassword"
import generateToken from "../utils/generateToken"

const Mutation = {
  async login(parent, args, { prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.data.email
      }
    })

    if (!user) {
      throw new Error("Unable to login.")
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password)

    if (!isMatch) {
      throw new Error("Unable to login.")
    }

    return {
      user,
      token: generateToken(user.id)
    }
  },
  async createUser(parent, args, { prisma }, info) {
    const password = await hashPassword(args.data.password)

    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password
      }
    })

    return {
      user,
      token: generateToken(user.id)
    }
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    if (typeof args.data.password === "string") {
      args.data.password = await hashPassword(args.data.password)
    }

    return prisma.mutation.updateUser(
      {
        where: {
          id: userId
        },
        data: args.data
      },
      info
    )
  },
  deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.mutation.deleteUser({ where: { id: userId } }, info)
  },
  createPost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.mutation.createPost(
      {
        data: {
          title: args.data.title,
          body: args.data.body,
          published: args.data.published,
          author: { connect: { id: userId } }
        }
      },
      info
    )
  },
  async updatePost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const postExistsAndBelongsToMe = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!postExistsAndBelongsToMe) {
      throw new Error("Post could not be updated.")
    }

    const isPublished = await prisma.exists.Post({
      id: args.id,
      published: true
    })

    if (isPublished && args.data.published === false) {
      await prisma.mutation.deleteManyComments({
        where: {
          post: { id: args.id }
        }
      })
    }

    return prisma.mutation.updatePost(
      {
        where: {
          id: args.id
        },
        data: args.data
      },
      info
    )
  },
  async deletePost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const postExistsAndBelongsToMe = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!postExistsAndBelongsToMe) {
      throw new Error("Unable to delete post.")
    }

    return prisma.mutation.deletePost(
      {
        where: { id: args.id }
      },
      info
    )
  },
  async createComment(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const publishedPostExists = await prisma.exists.Post({
      id: args.data.post,
      published: true
    })

    if (!publishedPostExists) {
      throw new Error("Post does not exist, or is not yet published.")
    }

    return prisma.mutation.createComment(
      {
        data: {
          text: args.data.text,
          author: {
            connect: { id: userId }
          },
          post: {
            connect: { id: args.data.post }
          }
        }
      },
      info
    )
  },
  async updateComment(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const commentExistsAndBelongsToMe = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!commentExistsAndBelongsToMe) {
      throw new Error("Comment could not be updated.")
    }

    return prisma.mutation.updateComment(
      {
        where: { id: args.id },
        data: args.data
      },
      info
    )
  },
  async deleteComment(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const commentExistsAndBelongsToMe = await prisma.exists.Comment({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!commentExistsAndBelongsToMe) {
      throw new Error("Comment could not be deleted.")
    }

    return prisma.mutation.deleteComment(
      {
        where: {
          id: args.id
        }
      },
      info
    )
  }
}

export default Mutation
