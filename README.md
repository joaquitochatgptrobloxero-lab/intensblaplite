# IntensBLAPlite

HTTP Typewriter replacement starter for Build Logic.

## Endpoints
- `GET /typewriter/read`: requires the HTTP header `sid: YOUR_SID`; returns JSON such as `{"value":"10000001"}` and advances one character per request.
- `GET /typewriter/edit`: opens the EDIT form.
- `POST /typewriter/edit`: form fields `sid` and `text`; saves up to 512 characters and resets reading to the first character.
- `GET /health`: returns `{"ok":true}`.

## Encoding in this starter
- First bit: output enabled (`1`)
- Second bit: uppercase/shift (`1` for uppercase, `0` for lowercase)
- Last six bits: A=1 through Z=26; space and unsupported characters map to `10000000`.
- Lowercase `a` -> `10000001`; uppercase `A` -> `11000001`.

This encoding is based on the observed example and must be checked against the actual Build Logic circuit before relying on every character.

## Deploy free on Render
1. Create a GitHub repository and upload `server.js`, `package.json`, and this README.
2. In Render, choose **New → Web Service** and connect that repository.
3. Set Build Command to `npm install`, Start Command to `npm start`, and choose the Free instance.
4. Deploy. Render gives you a URL like `https://YOUR-SERVICE.onrender.com`.

Then use:
- EDIT: `https://YOUR-SERVICE.onrender.com/`
- READ: `https://YOUR-SERVICE.onrender.com/typewriter/read`

Keep the `sid` header and your existing SID in Build Logic.

## Limitations
This starter keeps data in memory only. Free hosting can sleep, restart, or clear stored text. The code can be redeployed from your repository, but no free host can guarantee uninterrupted uptime.
