const axios = require('axios');
const debug = require('debug')('slash-command-template:ticket');
const qs = require('querystring');
const message = require('./message');

const apiUrl = 'https://slack.com/api';

/*
 *  Gets a result from Atlassian confluence search results
 */
const search = (req_message, channel, user, confluenceSpace, resultOffset) => {
  // Retrieve the keywords part of the slack message
  const keyword = message.parseMessageKeywords(req_message);
  const confluenceType = 'page'; // Set the type of confluence content to search
  // Build a query string for searching
  const confluenceCli = 'siteSearch+~+"' + keyword + '"+and+space+=+"' 
    + confluenceSpace + '"+and+type+=+"' + confluenceType + '"';

  // Do GET request to atlassian search api for just one top result
  // Example: https://domain.atlassian.net/wiki/rest/api/search?cql=siteSearch+~+%22timesheet%22+and+space+%3D+%22PD%22+and+type+%3D+%22page%22&queryString=timesheet&start=0&limit=1
  axios({
    method:'get',
    url: process.env.CONFLUENCE_API_URL + '/wiki/rest/api/search',
    auth: {
      username: process.env.CONFLUENCE_USER, 
      password: process.env.CONFLUENCE_API_KEY
    },
    params: {
      cql: confluenceCli,
      limit: 1,
      start: resultOffset,
      queryString: keyword
    }
  }).then(function (response) {
    var help_message = '';

    // If we get a response item back from atlassian
    if (typeof response.data.results[0] !== 'undefined') {
      // Build the response message for the first and only response content
      help_message = 'I found: ' 
        + '<' + response.data._links.base + response.data.results[0].url
        + '|' + response.data.results[0].content.title + '>.'
        + '\nYou may also '
        + '<' + process.env.CONFLUENCE_API_URL + '/wiki/dosearchsite.action?cli='
        + confluenceCli + '&amp;queryString=' + keyword
        + '|' + 'view all confluence results>.';
    }
    // Else no results found message
    else {
      help_message = 'I didn\'t find anything but you can '
        + '<' + process.env.CONFLUENCE_API_URL + '/wiki/dosearchsite.action?cli='
        + confluenceCli + '&amp;queryString=' + keyword
        + '|' + 'view all confluence results>';
    }

    // Construct parameters needed for a result message post
    var params = {
      token: process.env.SLACK_ACCESS_TOKEN,
      icon_emoji: ':forumone:',
      channel: channel,
      user: user,
      text: help_message
    };

    // Post the actual help message to Slack
    axios.post(`${apiUrl}/chat.postEphemeral`, qs.stringify(params))
      .then((result) => {
        debug('chat.postEphemeral: %o', result.data);
      }).catch((err) => {
        debug('chat.postEphemeral call failed: %o', err);
      });
  
  }).catch(function (error) {
    console.log(error);
  });
};

module.exports = { search };
