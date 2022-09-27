import { serve } from "https://deno.land/std@0.157.0/http/server.ts"
import { serveFile } from "https://deno.land/std@0.157.0/http/file_server.ts?s=serveFile"


const req_handler = async req => {

    const upgrade = req.headers.get ("upgrade") || ""

    if (upgrade.toLowerCase() == "websocket") {
        console.log (`websocket called`)
        const { socket } = Deno.upgradeWebSocket (req)
        console.log (socket)

        socket.onopen = () => console.log("socket opened");
        socket.onmessage = (e) => {
          console.log("socket message:", e.data);
          socket.send(new Date().toString());
        };
        socket.onerror = (e) => console.log("socket errored:", e.message);
        socket.onclose = () => console.log("socket closed");
    }

    const path = new URL (req.url).pathname

    switch (path) {
        case "/control":
            return serveFile (req, `control/index.html`)
        case "/control/script.js":
            return serveFile (req, `control/script.js`)
        case "/":
            return serveFile (req, `public/index.html`)
        case "/script.js":
            return serveFile (req, `public/script.js`)
        }
}

serve (req_handler, { port: 80 })
