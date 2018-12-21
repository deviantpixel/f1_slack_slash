# Slash Command and Dialogs blueprint

## Searches Confluence spaces using a Slash Command

Use a slash command to search confluences spaces for results based on keyword search. Once results are found, the first is returned with information to see more.

## Setup

#### Create a Slack app

1. Create an app at [https://api.slack.com/apps](https://api.slack.com/apps)
2. Add a Slash command (See *Add a Slash Command* section below)
3. Navigate to **Bot Users** and click "Add a Bot User" to create one.
4. Navigate to the **OAuth & Permissions** page and add the following scopes:
    * `commands`
    * `bot`
    * `users:read`
    * `users:read.email`
    * `chat:write:bot`
5. Click 'Save Changes' and install the app (You should get an OAuth access token after the installation)

#### Add a Slash Command
1. Go back to the app settings and click on Slash Commands.
1. Click the 'Create New Command' button and fill in the following:
    * Command: `/f1help`
    * Request URL: This apps base URL + `/command`
    * Short description: `Provides helpful Confluence information`
    * Usage hint: `[question] (or documentation) [word or phrase]`

#### Run the app
1. Get the code
    * Clone this repo and run `npm install`
2. Clone file named `.env.sample` to `.env` and set the following environment variables in it:
    * `SLACK_ACCESS_TOKEN`: Your bot token, `xoxb-` (available on the **OAuth & Permissions** once you install the app)
    * `SLACK_SIGNING_SECRET`: Your app's Signing Secret (available on the **Basic Information** page)
    * `CONFLUENCE_API_KEY`: Your confluence app's key (available on the **Manage Your account -> Security** page)
    * `CONFLUENCE_USER`: Confluence user name of account that will perform confluence searches (must have access to desired confluence spaces)
    * `CONFLUENCE_API_URL`: Your confluence base url
3. If you're running the app locally, run the app (`npm start`).
