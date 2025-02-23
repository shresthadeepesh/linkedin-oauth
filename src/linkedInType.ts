export interface LinkedInOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

export interface UserProfile {
  sub: string;
  email: string;
  given_name: string;
  family_name: string;
  picture?: string;
  email_verified?: boolean;
}
