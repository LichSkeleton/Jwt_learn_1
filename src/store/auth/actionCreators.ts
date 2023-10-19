import { Dispatch } from "@reduxjs/toolkit"
import api from "../../api"
import { ILoginRequest, ILoginResponse } from "../../api/auth/types"
import { loginStart, loginSucess, loginFailure, logoutSuccess,loadProfileStart, loadProfileFailure, loadProfileSucess } from "./authReducer"
import { history } from '../../utils/history'
import { store } from ".."
import { AxiosPromise, AxiosResponse } from "axios"
import { isTokenExpiringSoon } from "../../utils/jwt"

export const loginUser =
  (data: ILoginRequest) =>
    async (dispatch: Dispatch<any>): Promise<void> => {
      try {
        dispatch(loginStart())

        const res = await api.auth.login(data)

        dispatch(loginSucess(res.data.accessToken))
        dispatch(getProfile())

      } catch (e: any) {
        console.error(e)

        dispatch(loginFailure(e.message))
      }

    }

    export const logoutUser =
      () =>
      async (dispatch: Dispatch): Promise<void> => {
          try {
            await api.auth.logout()
    
            dispatch(logoutSuccess())
    
            history.push('/')
          } catch (e) {
              console.error(e)
          }

        }

        export const getProfile = () =>
        async (dispatch: Dispatch<any>): Promise<void> => {
          try {
            dispatch(loadProfileStart())
      
            const res = await api.auth.getProfile()
      
            dispatch(loadProfileSucess(res.data))
          } catch (e: any) {
            console.error(e)
      
            dispatch(loadProfileFailure(e.message))
          }
        }
        
        // змінна для зберігання запиту токена (для запобігання race condition)
        let refreshTokenRequest: AxiosPromise<ILoginResponse> | null = null

            const callRefreshToken = async () => {
              try {
                refreshTokenRequest = api.auth.refreshToken();
                console.log("refreshTokenRequest: " + refreshTokenRequest);
              } catch (e) {
                console.log("Error refreshing token: ");
                console.error(e);
              }
            };
            export const getAccessToken = () => async (dispatch: Dispatch<any>): Promise<string | null> => {
              try {
                const accessToken = store.getState().auth.authData.accessToken;
            
                if (!accessToken || isTokenExpiringSoon(accessToken,60)) {
                  if (refreshTokenRequest === null) {
                    await callRefreshToken(); // Call the refreshToken function
                  }
            
                  if (refreshTokenRequest) { // Check if refreshTokenRequest is not null
                    let res1: AxiosResponse<ILoginResponse> | null = null; // Declare res with null initially
                    try {
                      res1 = await refreshTokenRequest;
                      console.log("Refresh token response:");
                      console.log(res1);
                    } catch (e) {
                      console.error("Error fetching access token: " + e);
                    }
            
                    if (res1 && res1.data && res1.data.accessToken) { // Check res and its properties for null
                      dispatch(loginSucess(res1.data.accessToken));
                      refreshTokenRequest = null;
                      return res1.data.accessToken;
                    } else {
                      return null;
                    }
                  } else {
                    return null;
                  }
                }
            
                return accessToken;
              } catch (e) {
                console.log("ERROR:");
                console.log(e);
                return null;
              }
            };