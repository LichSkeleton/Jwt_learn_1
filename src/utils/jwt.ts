import { getUnixTime } from "./date"

export interface IAuthTokenInfo {
    exp: number
    iat: number
    login: string
}

const LIFE_TIME_TO_UPDATE_MULTIPLIER = 0.5

export const isTokenExpired = (token: string | null): boolean => {
  if (!token) {
      return true
  }

  try {
      const tokenInfo = token.split('.')[1]
    //   console.log("tokenInfo: " + tokenInfo);
      const tokenInfoDecoded = window.atob(tokenInfo)
    //   console.log("tokenInfoDecoded: " + tokenInfoDecoded);

      const { exp, iat }: IAuthTokenInfo = JSON.parse(tokenInfoDecoded)

      const tokenLeftTime = exp - getUnixTime()

    //   console.log("tokenLeftTime: " + tokenLeftTime);


      const minLifeTimeForUpdate = (exp - iat) * LIFE_TIME_TO_UPDATE_MULTIPLIER
    //   console.log("minLifeTimeForUpdate: " + minLifeTimeForUpdate);

    //   console.log("tokenLeftTime < minLifeTimeForUpdate: " + (tokenLeftTime < minLifeTimeForUpdate));
      return tokenLeftTime < minLifeTimeForUpdate
  } catch (e) {
      console.error(e)
      return true
  }
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
