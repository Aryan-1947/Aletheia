export const auth0Config = {
  domain: "dev-zot4kk3hoskmk6k4.us.auth0.com",
  clientId: "F9RK2xD0L5zUsA7eMbrzitgCUh2p46Ed",
  authorizationParams: {
    redirect_uri: window.location.origin,
  },
  // Persist the session in localStorage instead of only in-memory, so a hard
  // page refresh restores the logged-in session instantly instead of
  // triggering a visible re-login prompt while Auth0 silently re-authenticates.
  cacheLocation: "localstorage",
  useRefreshTokens: true,
}