import { Dispatch } from "@reduxjs/toolkit"
import api from "../../api"
import { ILoginRequest, ILoginResponse } from "../../api/auth/types"
import { loginStart, loginSucess, loginFailure, logoutSuccess,loadProfileStart, loadProfileFailure, loadProfileSucess } from "./authReducer"
import { history } from '../../utils/history'
import { store } from ".."
import { AxiosPromise, AxiosResponse } from "axios"
import { isTokenExpired, isTokenExpiringSoon } from "../../utils/jwt"

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
        
        // export const getAccessToken = () => async (dispatch: Dispatch<any>): Promise<string | null> => {
        //         try {
        //             const accessToken = store.getState().auth.authData.accessToken
        //             // console.log("accessToken: " + accessToken);
        //             // console.log("isTokenExpired(accessToken): " + isTokenExpired(accessToken));
        //             // console.log("refreshTokenRequest: " + refreshTokenRequest);
        //             // console.log("api.auth.refreshToken(): " + api.auth.refreshToken());  - not work

        //             if (!accessToken || isTokenExpired(accessToken)) {
        //               if (refreshTokenRequest === null) {
        //                   refreshTokenRequest = api.auth.refreshToken();
        //                   console.log("refreshTokenRequest: " + refreshTokenRequest);
        //               }
                      
        //               const res = await refreshTokenRequest
        //               refreshTokenRequest = null
        //               // console.log("res: " + res);
        //               // console.log("res.data.accessToken: " + res.data.accessToken);
        //               // console.log("loginSucess(res.data.accessToken): " + loginSucess(res.data.accessToken));

        
        //               dispatch(loginSucess(res.data.accessToken))
        
        //               return res.data.accessToken
        //             }
        
        //             return accessToken
        //         } catch (e) {
        //             console.log("ERROR:");
        //             console.log(e);
        //             // console.error(e)
        
        //             return null
        //         }
        //     }

        
            const callRefreshToken = async () => {
              try {
                refreshTokenRequest = api.auth.refreshToken();
                console.log("refreshTokenRequest: " + refreshTokenRequest);
                // Assuming that the response contains an 'accessToken' property
                // const newAccessToken = response.data.accessToken;
              } catch (e) {
                console.log("Error refreshing token: ");
                console.error(e);
              }
            };
            export const getAccessToken = () => async (dispatch: Dispatch<any>): Promise<string | null> => {
              try {
                const accessToken = store.getState().auth.authData.accessToken;
            
                if (!accessToken || isTokenExpiringSoon(accessToken,20)) {
                  if (refreshTokenRequest === null) {
                    await callRefreshToken(); // Call the refreshToken function
                  }
            
                  if (refreshTokenRequest) { // Check if refreshTokenRequest is not null
                    let res1: AxiosResponse<ILoginResponse> | null = null; // Declare res with null initially
                    // try {
                    //   const res = await refreshTokenRequest;
                    //   console.log("0Refresh token response:", res);
                    // } catch (e) {
                    //   console.error("0Error fetching access token: " + e);
                    // }

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
                      // Handle the case where res or its properties are null
                      return null;
                    }
                  } else {
                    // Handle the case where refreshTokenRequest is null
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