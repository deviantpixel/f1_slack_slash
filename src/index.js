require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const confluence = require('./confluence');
const message = require('./message');
const signature = require('./verifySignature');
const debug = require('debug')('slash-command-template:index');

const apiUrl = 'https://slack.com/api';

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

// Default response for base GET request
app.get('/', (req, res) => {
  res.send('<h2>The Slash Command and Dialog app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

/*
 * Endpoint to receive /f1help slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/command', (req, res) => {
  // extract the slash command text, and trigger ID from payload
  const { text, trigger_id } = req.body;
  
  // Verify the signing secret
  if (signature.isVerified(req)) {
    // Response to Data
    if (req.body.text !== null) {
      // Match the message to a desired action
      switch (message.parseMessageAction(req.body.text)) {
        case 'help':
          // If help action return help information
          runHelp(req.body.channel_id, req.body.user_id);
          break;
        case 'question':
          // If question action search the PD space of confluence
          confluence.search(req.body.text, req.body.channel_id, req.body.user_id, 'PD', 0);
          break;
        case 'documentation':
          // If documentation action search the TECH space of confluence
          confluence.search(req.body.text, req.body.channel_id, req.body.user_id, 'TECH', 0);
          break;
      }
    }
  } else {
    // Not a valid request origin and deny confluence response
    debug('Verification token mismatch');
    res.sendStatus(404);
  }
});

// Show Help Text
function runHelp(channel, user) {
  // TODO: Add better help message
  // Construct parameters needed for a help message post
  const params = {
    token: process.env.SLACK_ACCESS_TOKEN,
    icon_emoji: ':forumone:',
    channel: channel,
    user: user,
    text: `Type /f1help followed by a request like 'question where is dev documentation', and I will try to find an answer.`
  };

  // Post the actual help message to Slack
  axios.post(`${apiUrl}/chat.postEphemeral`, qs.stringify(params))
    .then((result) => {
      debug('chat.postEphemeral: %o', result.data);
      res.send('');
    }).catch((err) => {
      debug('chat.postEphemeral call failed: %o', err);
      res.sendStatus(500);
    });
}

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});
