'use strict';
//require('dotenv-safe').load();
const http = require('http');
const express = require('express');
const {urlencoded} = require('body-parser');
const twilio = require('twilio');
const ClientCapability = twilio.jwt.ClientCapability;
const VoiceResponse = twilio.twiml.VoiceResponse;


const app = express();
app.use('/node_modules', express.static(__dirname + '/node_modules'));
app.use(express.static(__dirname + '/public'));
app.use(urlencoded({extended: false}));

// Generate a Twilio Client capability token
app.get('/token', (request, response) => {
  const capability = new ClientCapability({
    accountSid: 'AC72708874e4335da2de63991c9d341951', //process.env.TWILIO_ACCOUNT_SID,
    authToken: '43ca8308c006567f5e6fef491ed5fa29' //process.env.TWILIO_AUTH_TOKEN
  });

  capability.addScope(
    new ClientCapability.OutgoingClientScope({
      applicationSid: 'APaa8360b78001bea1983d3a5b646bacd7'  //process.env.TWILIO_TWIML_APP_SID
    })
  );

  const token = capability.toJwt();

  // Include token in a JSON response
  response.send({
    token: token,
  });
});

// Create TwiML for outbound calls
app.post('/voice', (request, response) => {
  const voiceResponse = new VoiceResponse();
  voiceResponse.dial({
    callerId: +19724573070, //process.env.TWILIO_NUMBER,
  }, request.body.number);

  console.log("request - " + voiceResponse.toString());

  response.type('text/xml');
  response.send(voiceResponse.toString());
});

const server = http.createServer(app);
const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Express Server listening on *:${port}`);
});

module.exports = app;
