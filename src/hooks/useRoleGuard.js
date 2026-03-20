export const hasRole = (user, roles = []) => {
  if (!user) return false
  return roles.includes(user.role)
}
