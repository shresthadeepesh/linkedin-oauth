## LinkedIn Oauth Implementation

### Guides:

- Register two endpoints
- - First for hitting the Linkedin API which enforces the user to login in the Linkedin and get the temporary access code.
- - Second for the callback url, which should uses the temporary code to get the access token and the user profile, using it either we can authenticate in the application server.

### For Details and examples look into `src/examples/index.ts`.
