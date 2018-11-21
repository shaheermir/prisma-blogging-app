import { Prisma } from "prisma-binding"
import { fragmentReplacements } from "./resolvers"

const prisma = new Prisma({
  typeDefs: "src/generated/prisma.graphql",
  endpoint: process.env.PRISMA_ENDPOINT,
  secret: "thisismysupersecretsecret",
  fragmentReplacements
})

export default prisma

// const createPostForUser = async (authorID, data) => {
//   const userExists = await prisma.exists.User({ id: authorID })

//   if (!userExists) {
//     throw new Error("User does not exist.")
//   }

//   const post = await prisma.mutation.createPost(
//     {
//       data: {
//         ...data,
//         author: {
//           connect: {
//             id: authorID
//           }
//         }
//       }
//     },
//     "{ author { id name email posts { id title published } } }"
//   )

//   return post.author
// }

// const updatePostForUser = async (postID, data) => {
//   const postExists = await prisma.exists.Post({ id: postID })

//   if (!postExists) {
//     throw new Error("Post does not exist.")
//   }

//   const post = await prisma.mutation.updatePost(
//     {
//       where: {
//         id: postID
//       },
//       data
//     },
//     "{  author { id name email posts { id title published } } }"
//   )

//   return post.author
// }

// updatePostForUser("cjo6iere900170a40ut8ntxyx", { published: true })
//   .then(data => console.log(JSON.stringify(data, null, 4)))
//   .catch(err => console.error(err.message))

// // createPostForUser("cjo3pflhv002709407yt8rrw0", {
// //   title: "Umais' third post!",
// //   body: "FIFA fo life homie",
// //   published: false
// // })
// //   .then(data => console.log(JSON.stringify(data, null, 4)))
// //   .catch(err => console.error(err.message))
