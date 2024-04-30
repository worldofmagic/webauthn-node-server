const challengeRepository = require("../repositories/challengeRepository");
const authenticatorRepository = require("../repositories/authenticatorRepository");
const userRepository = require("../repositories/userRepository");
const asyncHandler = require("express-async-handler");
const error = require("../constrains/error");
const webauthnUtils = require('../utils/webauthnUtils');
const bufferUtils = require('../utils/bufferUtils');
const jwtUtils = require('../utils/jwtUtils');
const { response } = require("express");

const rpId = process.env.RPID;
const rpName = process.env.RPNAME;
const expectedOrigins = process.env.EXPECTEDORIGINS;

exports.registerStart = asyncHandler(async (req, res, next) => {
    let username = req.body.username;
    let rawChallengeStr = webauthnUtils.getNewChallenge();
    let convertedChallengeStr = webauthnUtils.convertChallenge(rawChallengeStr);
    let challenge = {
        username: username,
        challengeStr: convertedChallengeStr,
        createdAt: new Date()
    }

    challengeRepository.saveChallenge(challenge)
        .catch(err => {
            return next(error.getDatabaseError(err));
        }).then(response => {
            if (response == null) {
                return next(error.getNotFoundError());
            }
        });

    const pubKey = {
        challenge: rawChallengeStr,
        rp: {
            id: rpId,
            name: rpName
        },
        user: {
            id: username,
            username: username,
            displayName: username
        },
        pubKeyCredParams: [
            { type: 'public-key', alg: -7 },
            { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
            requireResidentKey: false,
        }
    };

    // authenticatorRepository.saveAuthenticator(pubKey)
    //     .catch(err => {
    //         return next(error.getDatabaseError(err));
    //     }).then(response => {
    //         if (response == null) {
    //             return next(error.getNotFoundError);
    //         }
    //     });

    res.status(200).json(pubKey);

});

exports.registerFinish = asyncHandler(async (req, res, next) => {
    const username = req.body.username;
    // Verify the attestation response
    let verification;
    let challenge = await challengeRepository.getChallengeByUsername(username).catch(err => {
        return next(error.getDatabaseError(err));
    }).then(response => {
        if (response == null) {
            return next(error.getNotFoundError());
        } else {
            return response;
        }
    });
    console.log("----> : ", challengeStr);

    try {
        verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
            response: req.body.data,
            expectedChallenge: challenge.challengeStr,
            expectedOrigin: expectedOrigins
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
    const { verified, registrationInfo } = verification;
    if (verified) {
        let authenticator = bufferUtils.getRegistrationInfo(registrationInfo);
        authenticatorRepository.saveAuthenticator(authenticator)
            .catch(err => {
                return next(error.getDatabaseError(err));
            }).then(response => {
                if (response == null) {
                    return next(error.getNotFoundError);
                }
            });
        return res.status(200).json({
            username: req.body.username,
            status: "register success"
        });
    }
    res.status(500).json({
        name: "Authentication Error",
        message: "This record is already existing in the system.",
        errorCode: 409
    });
});

exports.loginStart = asyncHandler(async (req, res, next) => {
    let username = req.body.username;
    // TODO: user exists check shoule be done against DB.
    let authenticator = await authenticatorRepository.getAuthenticatorByUsername(username);

    if (!authenticator) {
        return next(error.getNotFoundError());
    }

    let rawChallengeStr = webauthnUtils.getNewChallenge();
    let convertedChallengeStr = webauthnUtils.convertChallenge(rawChallengeStr);
    let challenge = {
        username: username,
        challengeStr: convertedChallengeStr,
        createdAt: new Date()
    }

    challengeRepository.saveChallenge(challenge)
        .catch(err => {
            return next(error.getDatabaseError(err));
        }).then(response => {
            if (response == null) {
                return next(error.getNotFoundError());
            }
        });
    
    res.json({
        challenge: challenge.challengeStr,
        rpId: rpId,
        allowCredentials: [{
            type: 'public-key',
            id: authenticator.credentialID,
            transports: ['internal'],
        }],
        userVerification: 'preferred',
    });
});

exports.loginFinish = asyncHandler(async (req, res, next) => {
    let username = req.body.username;

    let authenticator = await authenticatorRepository.getAuthenticatorByUsername(username);
    // TODO: user exists check shoule be done against DB.
    if (!authenticator) {
        return next(error.getNotFoundError());
    }

    let challenge = await challengeRepository.getChallengeByUsername(username);

    let verification;
    try {
        verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
            expectedChallenge: challenge.challengeStr,
            response: req.body.data,
            authenticator: bufferUtils.getSavedAuthenticatorData(user),
            expectedRPID: rpId,
            expectedOrigin: expectedOrigins,
            requireUserVerification: false
        });
    } catch (error) {
        console.error(err);
        return next(error.getAuthenticationError(err));
    }

    const {verified} = verification;

    let tokenPayload = {
        username: req.body.username,
        createdAt: new Date(),
        exipry: 30
    }
    let token = jwtUtils.generateJwt(tokenPayload);

    return res.status(200).header("loginToken", tokenPayload).json({
        res: verified
    });
});