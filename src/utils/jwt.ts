import { getUnixTime } from "./date"

export interface IAuthTokenInfo {
    exp: number
    iat: number
    login: string
}

export const isTokenExpiringSoon = (token: string | null, thresholdSeconds: number = 10): boolean => {
  if (!token) {
    return true;
  }

  try {
    const tokenInfo = token.split('.')[1];
    const tokenInfoDecoded = window.atob(tokenInfo);
    const { exp }: IAuthTokenInfo = JSON.parse(tokenInfoDecoded);

    const tokenLeftTime = exp - getUnixTime();

    // Check if the token is expiring soon (less than thresholdSeconds)
    return tokenLeftTime < thresholdSeconds;
  } catch (e) {
    console.error(e);
    return true;
  }
};
