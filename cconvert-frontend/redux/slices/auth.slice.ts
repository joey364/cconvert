export const setToken = (token: string) => ({
  type: 'auth/setToken',
  payload: token,
});

export const logout = () => ({
  type: 'auth/logout',
});
