import * as queryString from "node:querystring";
import axios from "axios";
import {
  LinkedInAuthUrl,
  LinkedInProfileUrl,
  LinkedInTokenUrl,
} from "./constants";
import { LinkedInOAuthException } from "./linkedInOAuthException";
import {
  AccessTokenResponse,
  LinkedInOAuthConfig,
  UserProfile,
} from "./linkedInType";

export class LinkedInOAuth {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  private defaultScopes: string[] = ["email", "profile", "openid"];

  constructor(config: LinkedInOAuthConfig) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.redirectUri = config.redirectUri;
  }

  getAuthorizationUrl(state?: string, scopes: string[] = this.defaultScopes) {
    const params = queryString.stringify({
      response_type: "code",
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
      scopes,
      state,
    });

    return `${LinkedInAuthUrl}?${params}`;
  }

  async getAccessToken(code: string): Promise<AccessTokenResponse> {
    const params = queryString.stringify({
      grant_type: "authorization_code",
      code,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
    });

    try {
      const response = await axios.post(LinkedInTokenUrl, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      return response.data;
    } catch (error: any) {
      throw new LinkedInOAuthException(
        `Failed to fetch access token: ${
          error?.response?.data?.error_description || error.message
        }`,
      );
    }
  }

  async getUserProfile(accessToken: string): Promise<UserProfile> {
    try {
      const response = await axios.get(LinkedInProfileUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data as UserProfile;
    } catch (error: any) {
      throw new LinkedInOAuthException(
        `Failed to get user profile: ${
          error?.response?.data?.error_description || error.message
        }`,
      );
    }
  }
}
