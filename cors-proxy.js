const http = require("http")
const https = require("https")

const TARGET = process.env.TARGET || "http://localhost:6767"
const PORT = parseInt(process.env.PORT || "8080")
const targetUrl = new URL(TARGET)

const httpLib = targetUrl.protocol === "https:" ? https : http

const server = http.createServer((req, res) => {
  const origin = req.headers.origin

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods":
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        req.headers["access-control-request-headers"] || "*",
      "Access-Control-Max-Age": "86400",
    })
    res.end()
    return
  }

  // Strip origin from forwarded headers (don't leak browser origin to backend)
  const forwardHeaders = { ...req.headers }
  delete forwardHeaders.origin
  forwardHeaders.host = targetUrl.host

  const options = {
    hostname: targetUrl.hostname,
    port: targetUrl.port || (targetUrl.protocol === "https:" ? 443 : 80),
    path: req.url,
    method: req.method,
    headers: forwardHeaders,
  }

  const proxyReq = httpLib.request(options, (proxyRes) => {
    const responseHeaders = { ...proxyRes.headers }
    // Echo back the request origin so browsers accept credentials: "include"
    responseHeaders["Access-Control-Allow-Origin"] = origin || "*"
    responseHeaders["Access-Control-Allow-Credentials"] = "true"
    res.writeHead(proxyRes.statusCode, responseHeaders)
    proxyRes.pipe(res)
  })

  proxyReq.on("error", (err) => {
    console.error("Proxy error:", err.message)
    res.writeHead(502, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ error: err.message }))
  })

  req.pipe(proxyReq)
})

server.listen(PORT, () => {
  console.log(`CORS proxy: http://localhost:${PORT} -> ${TARGET}`)
  console.log("  Echoes origin back (supports credentials: include)")
  console.log("  Handles CORS preflight")
})
