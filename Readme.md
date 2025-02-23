## LinkedIn Oauth Implementation

### Guides:

- Register two endpoints
- - First for hitting the Linkedin API which enforces the user to login in the Linkedin and get the temporary access code.
- - Second for the callback url, which should uses the temporary code to get the access token and the user profile, using it either we can authenticate in the application server.

### Getting the access code from the LinkedIn.

```
app.get("/linkedin", (req, res) => {
  const redirectUri = linkedInOAuth.getAuthorizationUrl();
  return res.redirect(redirectUri);
});
```

### Getting the access token and Linkedin Profile

```
app.get("/linkedin/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    console.error("No linkedin code available.");
    return res.redirect(`${LINKEDIN_FAILURE__CALLBACK_URI}?success=false`);
  }

  try {
    //retrieving access token to get the user profile...
    const linkedInAccessToken = await linkedInOAuth.getAccessToken(code);
    const linkedInProfile = await linkedInOAuth.getUserProfile(
    linkedInAccessToken.access_token,
    );

    // Use the linkedin profile to either register or signup or create a seperate endpoint to handle each register/login
    const applicationAccessToken =
      mockApplication.loginOrSignUp(linkedInProfile);

    return res.redirect(
      `${LINKEDIN_SUCCESS_CALLBACK_URI}?success=true&accessToken=${applicationAccessToken}`,
    );
  } catch (err) {
    console.error(err);
    if (err instanceof LinkedInOAuthException) {
      return res.redirect(`${LINKEDIN_FAILURE__CALLBACK_URI}?success=false`);
    }
  }
});
```

### For Details and examples look into [here](https://github.com/shresthadeepesh/linkedin-oauth/blob/main/src/examples/index.ts).
