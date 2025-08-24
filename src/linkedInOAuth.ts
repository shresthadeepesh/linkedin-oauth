import axios from "axios";
import {
  LinkedInAuthUrl,
  LinkedInProfileUrl,
  LinkedInTokenUrl,
} from "./constants";
import { LinkedInOAuthException } from "./linkedInOAuthException";
import {
  AccessTokenResponse,
  IdTokenPayload,
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
    const params = new URLSearchParams({
      response_type: "code",
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectUri: this.redirectUri,
      scopes: scopes.join(' '),
    });

    if (state) params.set('state', state);

    return `${LinkedInAuthUrl}?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<AccessTokenResponse> {
    const params = new URLSearchParams({
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
        `Failed to fetch access token: ${error?.response?.data?.error_description || error.message
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
        `Failed to get user profile: ${error?.response?.data?.error_description || error.message
        }`,
      );
    }
  }

  getUserProfileFromIdToken(idToken: string): IdTokenPayload {
    const { payload } = this.decodeJWT<IdTokenPayload>(idToken);
    return payload as IdTokenPayload;
  }

  private decodeJWT<TPayload>(token: string): { header: unknown; payload: TPayload } {
    const [header, payload] = token.split(".");
    const decodeHeader = JSON.parse(Buffer.from(header, "base64url").toString());
    const decodePayload = JSON.parse(Buffer.from(payload, "base64url").toString());

    return {
      header: decodeHeader as unknown,
      payload: decodePayload as TPayload,
    };
  }
}
