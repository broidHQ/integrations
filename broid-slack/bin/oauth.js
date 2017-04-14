#!/usr/bin/env babel-node --

const express = require("express");
const bodyParser = require("body-parser");
const querystring = require("querystring");
const OAuth = require("oauth");
const commander = require("commander");
const opn = require("opn");

function generate (options) {
  const oauthClient = new OAuth.OAuth2(options.clientID, options.clientSecret,
    "https://slack.com", "/oauth/authorize", "/api/oauth.access")

  const params = {
    scope: "bot",
    response_type: "code",
  }

  // Setup the temp webserver
  const server = express()
  server.use(bodyParser.json())
  server.use(bodyParser.urlencoded({ extended: true }))
  server.get("/", (req, res) => {
    const code = req.query.code
    const opts = {
      client_id: options.clientID,
      client_secret: options.clientSecret,
      code,
    }

    const redirect_params = {}
    let redirect_uri = options.redirectURI
    if (redirect_uri) {
      Object.assign(redirect_params, req.query)
      delete redirect_params.code
      delete redirect_params.state

      const redirect_query = querystring.stringify(redirect_params)
      if (redirect_query) {
        redirect_uri = `${redirect_uri}?${redirect_query}`
      }
      opts.redirect_uri = redirect_uri
    }

    oauthClient.getOAuthAccessToken(code, opts,
      (err, accessToken, refreshToken, results) => {
        if (err) { res.status(500).send(err) }

        console.log(JSON.stringify(results, null, 2)) // eslint-disable-line no-console

        res.writeHead(200, { "Content-Type": "text/html" })
        res.end("<html><body>thanks, you can close this page now.</body></html>")

        setTimeout(() => process.exit(0), 3000)
      })
  })

  server.listen(3000, "0.0.0.0", () => {
    const auth_url = oauthClient.getAuthorizeUrl(params)
    opn(auth_url, { wait: false })
      .catch(console.log) // eslint-disable-line no-console
  })
}

commander
    .version("0.0.1")
    .option("-n, --new", "Generate a new token")
    .option("-c, --clientID <clientID>", "Client ID value")
    .option("-s, --clientSecret <clientSecret>", "Client secret value")
    .option("-r, --redirectURI <redirectURI>", "Optional: URL to redirect")
    .on("--help", () => {
      console.log("  Examples:")  // eslint-disable-line no-console
      console.log()  // eslint-disable-line no-console
      console.log("    $ oauth --new --clientID <xxxx> --clientSecret <xxxx>")  // eslint-disable-line no-console
      console.log()  // eslint-disable-line no-console
    })
    .parse(process.argv)

if (!commander.new) {
  commander.help()
  process.exit(1)
}

generate({
  create: commander.new,
  clientID: commander.clientID,
  clientSecret: commander.clientSecret,
  redirectURI: commander.redirectURI,
})
