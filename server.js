import { serve } from "https://deno.land/std@0.157.0/http/server.ts"
import { serveFile } from "https://deno.land/std@0.157.0/http/file_server.ts?s=serveFile"
import * as uuid from "https://deno.land/std@0.119.0/uuid/mod.ts";

let sockets = []
const req_handler = async req => {

    const path = new URL (req.url).pathname

    const upgrade = req.headers.get ("upgrade") || ""

    if (upgrade.toLowerCase() == "websocket") {

        const { socket, response } = Deno.upgradeWebSocket (req)

        const id = uuid.v1.generate ()

        socket.onopen = () => {
            sockets.push ({
                socket,
                id,
            })
        }

        socket.onmessage = e => sockets.forEach (s => {
            s.socket.send (e.data)
        })

        socket.onerror = e => console.log("socket errored:", e.message)

        socket.onclose = () => {
            sockets = sockets.filter (s => s.id !== id)
        }

        return response
    }


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
