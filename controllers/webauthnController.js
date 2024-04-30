const challengeRepository = require("../repositories/challengeRepository");
const authenticatorRepository = require("../repositories/authenticatorRepository");
const userRepository = require("../repositories/userRepository");
const asyncHandler = require("express-async-handler");
const error = require("../constrains/error");
const webauthnUtils = require('../utils/webauthnUtils');
const bufferUtils = require('../utils/bufferUtils');
const jwtUtils = require('../utils/jwtUtils');
const { response } = require("express");
const SimpleWebAuthnServer = require("@simplewebauthn/server");

const rpId = process.env.RPID;
const rpName = process.env.RPNAME;
const expectedOrigins = process.env.EXPECTEDORIGINS.split(',');


exports.registerStart = asyncHandler(async (req, res, next) => {
  console.log('[ENTRY REGISTER START]: ', req.body);
  let username = req.body.username;
  let challenge = webauthnUtils.getNewChallenge();
  // TODO: Put chanllenges into cache / DB for future usage.
  let convertedChallengeStr = webauthnUtils.convertChallenge(challenge);

  let challengeDoc = {
    username: username,
    challenge: convertedChallengeStr,
    createdAt: new Date()
  }

  await challengeRepository.saveChallenge(challengeDoc)
    .catch(err => {
      return next(error.getDatabaseError(err));
    }).then(response => {
      if (response == null) {
        return next(error.getNotFoundError());
      }
    });

  const pubKey = {
    challenge: challenge,
    rp: { id: rpId, name: 'webauthn-app' },
    user: { id: username, name: username, displayName: username },
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
  console.log('[EXIT REGISTER START]: ', pubKey);
  res.json(pubKey);
});

exports.registerFinish = asyncHandler(async (req, res, next) => {
  console.log('[ENTRY REGISTER FINISH]: ', req.body);
  const username = req.body.username;
  let challengeDoc = await challengeRepository.getChallengeByUsername(username).catch(err => {
    return next(error.getDatabaseError(err));
  }).then(response => {
    if (response == null) {
      return next(error.getNotFoundError());
    } else {
      return response;
    }
  });

  // Verify the attestation response
  let verification;
  // TODO: challenges should be retrieved from Cache/DB.
  try {
    verification = await SimpleWebAuthnServer.verifyRegistrationResponse({
      response: req.body.data,
      expectedChallenge: challengeDoc.challenge,
      expectedOrigin: expectedOrigins
    });
  } catch (err) {
    console.error("authentication error: ", err);
    return next(error.getAuthenticationError(err));
  }
  const { verified, registrationInfo } = verification;
  if (verified) {
    // TODO: user should be registered into DB.
    let authenticator = bufferUtils.getRegistrationInfo(registrationInfo);
    await authenticatorRepository.saveAuthenticator(authenticator)
      .catch(err => {
        return next(error.getDatabaseError(err));
      }).then(response => {
        if (response == null) {
          return next(error.getDatabaseError(new Error("Database Error")));
        }
      });
    console.log('[EXIT REGISTER START]: ', verified);
    return res.status(200).json({
      username: req.body.username,
      status: "register success"
    });
  }
  res.status(500).json({
    name: "Authentication Error",
    message: "Registration Failed",
    errorCode: 500
  });
});

exports.loginStart = asyncHandler(async (req, res, next) => {
  let username = req.body.username;
  // TODO: user exists check shoule be done against DB.
  if (!users[username]) {
    return res.status(404).send(false);
  }
  let challenge = getNewChallenge();

  // TODO: Put chanllenges into cache / DB for future usage.
  challenges[username] = convertChallenge(challenge);

  res.json({
    challenge,
    rpId,
    allowCredentials: [{
      type: 'public-key',
      id: users[username].credentialID,
      transports: ['internal'],
    }],
    userVerification: 'preferred',
  });
  // let username = req.body.username;
  // // TODO: user exists check shoule be done against DB.
  // let authenticator = await authenticatorRepository.getAuthenticatorByUsername(username);

  // if (!authenticator) {
  //   return next(error.getNotFoundError());
  // }

  // let rawChallengeStr = webauthnUtils.getNewChallenge();
  // let convertedChallengeStr = webauthnUtils.convertChallenge(rawChallengeStr);
  // let challenge = {
  //   username: username,
  //   challengeStr: convertedChallengeStr,
  //   createdAt: new Date()
  // }

  // challengeRepository.saveChallenge(challenge)
  //   .catch(err => {
  //     return next(error.getDatabaseError(err));
  //   }).then(response => {
  //     if (response == null) {
  //       return next(error.getNotFoundError());
  //     }
  //   });

  // res.json({
  //   challenge: challenge.challengeStr,
  //   rpId: rpId,
  //   allowCredentials: [{
  //     type: 'public-key',
  //     id: authenticator.credentialID,
  //     transports: ['internal'],
  //   }],
  //   userVerification: 'preferred',
  // });
});

exports.loginFinish = asyncHandler(async (req, res, next) => {
  let username = req.body.username;
  // TODO: user exists check shoule be done against DB.
  if (!users[username]) {
    return res.status(404).send(false);
  }
  let verification;
  try {
    // TODO: user should be retrieved from DB.
    const user = users[username];
    verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
      expectedChallenge: challenges[username],
      response: req.body.data,
      authenticator: getSavedAuthenticatorData(user),
      expectedRPID: rpId,
      expectedOrigin,
      requireUserVerification: false
    });
  } catch (error) {
    console.error(error);
    return res.status(400).send({ error: error.message });
  }

  const { verified } = verification;
  return res.status(200).send({
    res: verified
  });
  // let username = req.body.username;

  // let authenticator = await authenticatorRepository.getAuthenticatorByUsername(username);
  // // TODO: user exists check shoule be done against DB.
  // if (!authenticator) {
  //   return next(error.getNotFoundError());
  // }

  // let challenge = await challengeRepository.getChallengeByUsername(username);

  // let verification;
  // try {
  //   verification = await SimpleWebAuthnServer.verifyAuthenticationResponse({
  //     expectedChallenge: challenge.challengeStr,
  //     response: req.body.data,
  //     authenticator: bufferUtils.getSavedAuthenticatorData(user),
  //     expectedRPID: rpId,
  //     expectedOrigin: expectedOrigins,
  //     requireUserVerification: false
  //   });
  // } catch (error) {
  //   console.error(err);
  //   return next(error.getAuthenticationError(err));
  // }

  // const { verified } = verification;

  // let tokenPayload = {
  //   username: req.body.username,
  //   createdAt: new Date(),
  //   exipry: 30
  // }
  // let token = jwtUtils.generateJwt(tokenPayload);

  // return res.status(200).header("loginToken", tokenPayload).json({
  //   res: verified
  // });
});