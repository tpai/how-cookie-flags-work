SPA Double Submit Cookie
---

CSRF attack and protection demo in node server.

## Prerequisites

1. `sudo vim /etc/hosts` and add the following content.

    ```
    127.0.0.1 local.host
    127.0.0.1 sub.local.host
    127.0.0.1 remote.host
    ```

1. Install dependencies.

   ```
   yarn
   ```

1. Launch server.

   ```
   yarn start
   ```

## Usage

You could set cookie with different flags by sending queries.

```
# No restriction
http://local.host:3333/

# SameSite flag set to 'Lax'
http://local.host:3333/?sameSite=lax

# Enable HostOnly, HttpOnly and SameSite flag.
http://local.host:3333/?hostOnly=1&httpOnly=1&sameSite=Strict
```

## Scenario

Simulate attack and how to protect.

### Fake double submit cookie request from subdomain form

1. Set cookie at `http://local.host:3333/`.
1. Visit `http://sub.local.host:3333/form`.
1. Overwrite cookie and submit form to server and response success is `true`.

Use the following flags to defend:

- HostOnly: Disallow different origin to access cookie. (including subdomain)
- HttpOnly: Prevent JS to access cookie

### Fake request from remote domain

1. Set cookie at `http://local.host:3333/`.
1. Visit `http://remote.host:3333/link`.
1. Click link.
1. Check out server console, there are two requests with cookie from remote.

Use the following flags to defend:

- SameSite
    - None: All requests with third party cookie.
    - Lax: Only sync requests with third party cookie.
    - Strict: No third party cookie.
