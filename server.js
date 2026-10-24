
const express = require("express");

const app = express();
app.use(express.urlencoded({ extended: false, limit: "20kb" }));
app.use(express.json({ limit: "20kb" }));

const PORT = process.env.PORT || 10000;
const sessions = new Map();

function cleanSid(value) {
  return String(value || "").trim().slice(0, 10);
}

function encodeCharacter(character) {
  // Códigos de símbolos especiales confirmados.
  const symbolCodes = {
    ".": "100111",
    '"': "110111",
    ";": "101001",
    ",": "101000",
    "-": "100101",
    "[": "110101",
    "]": "110110",
    "/": "101010"
  };

  // Solo los símbolos especiales usan el 0 de control.
  if (Object.prototype.hasOwnProperty.call(symbolCodes, character)) {
    return "10" + symbolCodes[character];
  }

  // El espacio conserva su código original.
  if (character === " ") {
    return "10000000";
  }

  // Las letras conservan la codificación original.
  const upper = character.toUpperCase();

  if (!/^[A-Z]$/.test(upper)) {
    return "10000000";
  }

  const letterNumber = upper.charCodeAt(0) - 64;
  const sixBits = letterNumber.toString(2).padStart(6, "0");
  const shiftBit = character === upper ? "1" : "0";

  return "1" + shiftBit + sixBits;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.get("/", (_req, res) => {
  res.type("html").send(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>IntensBLAPlite</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#101522;color:#f5f7ff;font:16px system-ui,sans-serif;min-height:100vh;display:grid;place-items:center;padding:20px}
main{width:min(620px,100%);background:#1b2335;border:1px solid #35415d;border-radius:20px;padding:24px;box-shadow:0 18px 60px #0005}
h1{margin:0 0 8px;font-size:28px}
p{color:#c3cce0;line-height:1.5}
a{color:#9bc5ff}
label{display:block;font-weight:700;margin:16px 0 7px}
input,textarea{width:100%;border:1px solid #465574;border-radius:10px;background:#0e1421;color:#fff;padding:12px;font:inherit}
button{margin-top:14px;background:#8ab4ff;color:#111a2b;font-weight:800;border:0;border-radius:10px;padding:12px 16px;cursor:pointer}
.small{font-size:13px;color:#9daac4}
.links{display:flex;gap:16px;flex-wrap:wrap;margin-top:18px}
</style>
</head>
<body>
<main>
<h1>📡 IntensBLAPlite</h1>
<p>Reemplazo del HTTP Typewriter para Build Logic. Escribí un SID y el texto que querés transmitir.</p>
<form method="post" action="/typewriter/edit">
<label for="sid">SID (máximo 10 caracteres)</label>
<input id="sid" name="sid" maxlength="10" required placeholder="BrickNye2">
<label for="text">Texto</label>
<textarea id="text" name="text" maxlength="512" rows="5" required placeholder="Hola mundo"></textarea>
<button type="submit">Guardar texto</button>
</form>
<p class="small">Guarda el texto actual por SID en memoria. Si el servicio se reinicia o se duerme, los mensajes pueden borrarse.</p>
<div class="links">
<a href="/typewriter/edit">EDIT</a>
<a href="/typewriter/read">READ (requiere header sid)</a>
</div>
</main>
</body>
</html>`);
});

app.get("/typewriter/edit", (_req, res) => res.redirect("/"));

app.post("/typewriter/edit", (req, res) => {
  const sid = cleanSid(req.body.sid);
  const text = String(req.body.text || "").slice(0, 512);

  if (!sid) {
    return res.status(400).type("text").send("Missing sid");
  }

  sessions.set(sid, { text, index: 0 });

  res.type("html").send(`<!doctype html>
<html lang="es">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Texto guardado</title>
<body style="font:16px system-ui;background:#101522;color:#f5f7ff;padding:30px">
<h1>✅ Texto guardado</h1>
<p>SID: <b>${escapeHtml(sid)}</b></p>
<p>Caracteres: ${[...text].length}</p>
<p>El lector empieza desde el primer carácter la próxima vez que consultes READ.</p>
<p><a style="color:#9bc5ff" href="/">Volver a EDIT</a></p>
</body>
</html>`);
});

app.get("/typewriter/read", (req, res) => {
  const sid = cleanSid(req.get("sid"));

  if (!sid) {
    return res.status(400).json({ error: "Missing sid header" });
  }

  const session = sessions.get(sid);

  if (!session || session.index >= [...session.text].length) {
    return res.json({ value: "00000000" });
  }

  const characters = [...session.text];
  const value = encodeCharacter(characters[session.index]);

  session.index += 1;

  return res.json({ value });
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`IntensBLAPlite listening on port ${PORT}`);
});
