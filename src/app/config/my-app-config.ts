// Configuration object for OIDC (OpenID Connect) authentication
export default {

  // OIDC authentication settings
  oidc: {
    // Client ID from Okta application ,,,
    clientId:'0oan03bq65i0heZFB5d7',
    // URL when authorizing with Okta Authorization server, Issuer of tokens from Okta
    issuer: 'https://dev-76684086.okta.com/oauth2/default',
    // URL to redirect after successful login
    redirectUri: 'http://localhost:4200/login/callback',
    // Required authorization scopes, Scopes provide access to information about the user
    scopes: ['openid', 'profile', 'email']

    // openid => required for authentication requests
    // profile => required for getting user's first name,last name, phone etc
    // email => required for getting user's email

  }

}
