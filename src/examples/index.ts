import express, { Request, Response } from "express";
import { LinkedInOAuth } from "../linkedInOAuth";
import { LinkedInOAuthConfig } from "../linkedInType";
import { LinkedInOAuthException } from "../linkedInOAuthException";

const app = express();
const port = 3000;

// Real application
const mockApplication = {
  loginOrSignUp: (data: unknown) => {},
  login: (data: unknown) => {},
  register: (data: unknown) => {},
};

const config: LinkedInOAuthConfig = {
  clientId: "",
  clientSecret: "",
  redirectUri: "",
};

const LINKEDIN_SUCCESS_CALLBACK_URI = "";
const LINKEDIN_FAILURE__CALLBACK_URI = "";

const linkedInOAuth = new LinkedInOAuth(config);

app.get("/linkedin", (req, res) => {
  const redirectUri = linkedInOAuth.getAuthorizationUrl();
  return res.redirect(redirectUri);
});

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

app.listen(port, () => {
  console.log(`Application running on ${port}.`);
});
