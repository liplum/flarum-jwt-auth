# Flarum JSON Web Token Auth

## Installation

```bash
composer require liplum/flarum-jwt-auth
```

## Forum Setup

Setup the JWT authentication by following the steps below in the extension settings page.
You can find the corresponding backend implementation example in [the next chapter](#backend-setup).

### 1. Set the cookie name

Set the name of [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies) from the user browser requests. For example, "access_token".

### 2. Set the JWT audience

It's optional.

The extension will check if the `aud` field in JWT payload is identical to the JWT audience provided by admin settings.
If not, the JWT will be considered as invalid.

### 3. Set the JWT secret

The secret to sign(encode) and verify(decode) a JWT token.

The JWT payload should be something like this.

```json
{
  "sub": "your_user_id"
}
```

For security issue, you should set the JWT secret in the [config.php](https://docs.flarum.org/config/)
instead of barely display on extension settings page for anyone who has the extension management permission.

```php
<?php return array (
  'debug' => false,
  // other configurations...
  "liplum-jwt-auth" => array(
    "jwtSecret" => "access_token_secret"
  ),
);
```

### 4. Set the JWT Signing Algorithm

It's optional.

It's "HS256" by default, by following the default option from the [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) package.

### 5. Set the registration hook URL

The hook which will be called for new Flarum users.

The payload of the hook request is in [JSON:API](https://jsonapi.org/) which Flarum uses,
and the authentication can be checked via the `Authorization` header.

Here is something like the Flarum backend would request the hook:

```js
fetch(registrationHookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your_access_token'
  },
  body: JSON.stringify({
    "data": {
      "type": "users",
      "attributes": {
        "sub": "your_user_id"
      }
    }
  })
})
```

And the backend should handle the registration request and respond a the user attributes in [JSON:API](https://jsonapi.org/):

These attributes will be passed internally to [POST Flarum "/api/users"](https://docs.flarum.org/rest-api/#create-user), so any attribute added by other extensions can also be provided.

```json
{
  "data": {
    "type": "users",
    "attributes": {
      "username": "example",
      "email": "example@example.com"
    }
  }
}
```

By default, all accounts will be automatically enabled.
You can change this behavior by returning `"isEmailConfirmed": false` attributes in the registration hook.

### 6. Set the Authorization Header

It's optional.

If the field is left empty, the `Authorization` header will be "Token {jwt}".

Otherwise, the field will be directly sent as `Authorization` header without any modification.

Here is something like the evaluation process:

```js
const jwt = cookie.get("CookieName")
if (settings.of("AuthorizationHeader").isNotEmpty) {
  return settings.of("AuthorizationHeader")
} else {
  return `Token ${jwt}` // string interpolation
}
```

For security issue, you should set the Authorization header in the [config.php](https://docs.flarum.org/config/)
instead of barely display on extension settings page for anyone who has the extension management permission.

```php
<?php return array (
  'debug' => false,
  // other configurations...
  "liplum-jwt-auth" => array(
    "authorizationHeader" => "Bearer your_access_token"
  ),
);
```

## Backend Setup

Taking the [express.js](https://expressjs.com/) backend server as an example, you can set up the following routes.

```ts
// Run "npm install express jsonwebtoken" to install essential packages
import express from "express"
import jwt from "jsonwebtoken"

const app = express()
app.use(express.json())

const cookieName = process.env.COOKIE_NAME ?? "access_token"
const jwtSecret = process.env.JWT_SECRET ?? "access_token_secret"

app.post("/set-cookie", (req, res) => {
  const token = jwt.sign({
    // Edit this: it should be the user ID generally.
    sub: "jwt_subject",
  }, jwtSecret)
  return res.status(200).cookie(cookieName, token).end()
})

// Remove the interface declaration and "satisfies" expression bellow,
// if the plain javascript is used instead of typescript.
interface VerifyResult {
  data: {
    type: "users",
    attributes: {
      username: string
      email: string
      /**
       * Control whether the email of user is considered as verified.
       * "true" by default 
       */
      isEmailConfirmed?: boolean
    }
  }
}

app.post("/register", (req, res) => {
  const authHeader = req.headers["authorization"]
  // for custom Authorization header or `Token ${jwt}`
  if (!authHeader
    || authHeader !== "Bearer your_access_token"
    && !authHeader.startsWith("Token ")
  ) {
    return res.status(401).end()
  }
  const sub = req.body.attributes.sub
  // Complete this: check the sub (generally the user ID) in the database.
  return res.status(200).json({
    data: {
      type: "users",
      attributes: {
        // Edit this: Keep it following flarum's username rule.
        username: `name_of_${sub}`,
        // Edit this: Keep it following flarum's email rule.
        email: `email_of_${sub}@example.com`,
      }
    }
  } satisfies VerifyResult).end()
})

const port = 80
app.listen(port, () => {
  console.log(`Your backend is running on http://localhost:${port}`)
})
```

## Hidden Iframe

The hidden iframe offers a way to refresh the cookie in the background and optionally to provide auto login.

If the hidden iframe setting is set, the given URL will be loaded in a 0x0 iframe placed outside the browser viewport.

The iframe can use [`window.postMessage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) to inform Flarum of a change in the session state.
The message can be sent at any time and any number of times.
You can use a loop repeatedly sending the current state if necessary.

Flarum will check for a change in the reported state and prompt the user to refresh the page if it changes.

If `{jwtSessionState: 'login'}` is sent while Flarum is logged out, Flarum will say the user has been automatically logged in and may refresh the page.

If `{jwtSessionState: 'logout'}` is sent while Flarum is logged in, Flarum will say the session has expired and the user may refresh the page.

If the time elapsed between Flarum boot and the `postMessage` is smaller than the configured "Auto Login Delay", the page will refresh without user interaction.

Switching user without going through logout state is current not supported.

Code example for the iframe:

```js
window.parent.postMessage({
  jwtSessionState: 'login',
}, 'https://forum.example.com');
```

The last parameter should be set to the Flarum `origin`.
`'*'` can also be used but isn't recommended.

## Additional Reading

An admin user is used internally to call the REST API that creates new Flarum users.
By default, user with ID `1` will be used but this can be customized in the admin settings.
The value must be the Flarum ID (MySQL auto-increment) and not the JWT subject ID.

Users can be edited via their JWT subject ID by using the `PATCH /api/jwt/users/<sub>` endpoint.
It works exactly the same way as `PATCH /api/users/<id>` but takes the JWT subject ID instead of Flarum ID.

## Under the hood

Users are matched through the `jwt_subject` column in the database that is matched to the token's `sub` value.

The original Flarum session object (Symfony session) and cookie are not used for stateless authentication, however the cookie session is kept because Flarum and some extensions cannot work without it.

This session object is not invalidated during "login" and "logout" of the stateless JWT authentication, so there could be issues with extensions that rely on that object for other purposes than validation messages.

## Acknowledgement

Thanks to <https://github.com/clarkwinkelmann/flarum-ext-jwt-cookie-login> with `MIT License Copyright (c) 2022 Clark Winkelmann`.
