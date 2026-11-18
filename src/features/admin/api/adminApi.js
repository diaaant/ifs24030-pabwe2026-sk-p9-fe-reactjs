import { apiRequest } from '../../../helpers/apiHelper'

const data = async (path) => (await apiRequest(path)).data

export const listUsers = () => data('/api/admin/users')
export const listPosts = () => data('/api/admin/posts')
export const listUserPosts = (id) => data(`/api/admin/users/${id}/posts`)
