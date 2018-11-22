import { gql } from "apollo-boost"

const createUser = gql`
  mutation($data: CreateUserInput!) {
    createUser(data: $data) {
      token
      user {
        id
        name
        email
      }
    }
  }
`

const getUsers = gql`
  query {
    users {
      id
      name
      email
    }
  }
`

const getMyProfile = gql`
  query {
    me {
      id
      name
      email
    }
  }
`

const login = gql`
  mutation($data: LoginUserInput!) {
    login(data: $data) {
      token
    }
  }
`

export { createUser, getUsers, getMyProfile, login }
