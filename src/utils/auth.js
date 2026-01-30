const USERS_KEY = "sails_users";
const CURRENT_USER_KEY = "sails_current_user";

export function getUsers() {
  const s = localStorage.getItem(USERS_KEY);
  return s ? JSON.parse(s) : [];
}

export function saveUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

export function signupUser({ name, email, password }) {
  const users = getUsers();
  if (users.find((u) => u.email === email)) {
    return { success: false, message: 'Email already registered' };
  }
  const id = `user_${Date.now().toString(36).slice(3)}`;
  const user = { id, name, email, password };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function loginUser(email, password) {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return { success: false, message: 'Invalid credentials' };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return { success: true, user };
}

export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getCurrentUser() {
  const s = localStorage.getItem(CURRENT_USER_KEY);
  return s ? JSON.parse(s) : null;
}

export default { getUsers, signupUser, loginUser, logoutUser, getCurrentUser };
