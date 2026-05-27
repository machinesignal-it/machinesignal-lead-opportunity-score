import { createServer } from "node:http";
import { handleRequest } from "./core.mjs";

const port = Number(process.env.PORT || 8787);
const apiKey = process.env.MACHINESIGNAL_API_KEY || process.env.API_KEY || "";

function nodeRequestToFetchRequest(req, body) {
  const url = `http://${req.headers.host}${req.url}`;
  return new Request(url, {
    method: req.method,
    headers: req.headers,
    body: body.length ? body : undefined
  });
}

const server = createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const request = nodeRequestToFetchRequest(req, Buffer.concat(chunks));
  const response = await handleRequest(request, { MACHINESIGNAL_API_KEY: apiKey });
  res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(port, () => {
  console.log(`MachineSignal minimal API listening on http://127.0.0.1:${port}`);
  console.log("POST /v1/lead-opportunity-score");
});

