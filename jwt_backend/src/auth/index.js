const express = require("express");
const crypto = require("crypto");
const cookie = require("cookie");
const { passwordSecret, fakeUser } = require("./data");
const { getTokens, refreshTokenTokenAge, verifyAuthorizationMiddleware, verifyRefreshMiddleware } = require("./utils");


const authRouter = express.Router();

authRouter.post("/login", (req, res) => {
    const { login , password } = req.body;

    const hash = crypto
    .createHmac("sha256", passwordSecret)
    .update(password)
    .digest("hex");
    const isVerifiedPassword = hash === fakeUser.passwordHash;

    if(login !== fakeUser.login || !isVerifiedPassword){
        return res.status(401).send("Login fail");
    }

    const { accessToken, refreshToken } = getTokens(login);

    res.setHeader(
        "Set-Cookie",
        cookie.serialize("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: refreshTokenTokenAge,
            sameSite: "None",
            secure: true,
        })
    );
    
    res.send({accessToken});
});

const setAccessToken = (accessToken) => ({
    type: 'SET_ACCESS_TOKEN',
    payload: accessToken,
  });

authRouter.get("/refresh", verifyRefreshMiddleware, (req,res) => {
    const { accessToken, refreshToken } = getTokens(req.user.login);
    // console.log("getTokens(req.user.login)" + getTokens(req.user.login));
    // res.send("getTokens(req.user.login)" + getTokens(req.user.login));

    res.setHeader(
        "Set-Cookie",
        cookie.serialize("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 1000 * 60 *60,
            sameSite: "None",
            secure: true,
        })
    );
    // res.send({accessToken});
    res.json({ accessToken }); 
});

authRouter.get("/profile", verifyAuthorizationMiddleware, (req,res) => {
    res.send("admin");
});

authRouter.get("/logout", (req,res) => {
    res.setHeader(
        "Set-Cookie",
        cookie.serialize("refreshToken", "", {
            httpOnly: true,
            maxAge: 0,
            sameSite: "None",
            secure: true,
        })
    );
    res.sendStatus(200);
});

module.exports = authRouter;