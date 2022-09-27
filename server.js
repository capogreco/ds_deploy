import { serve } from "https://deno.land/std@0.157.0/http/server.ts"
import { serveFile } from "https://deno.land/std@0.157.0/http/file_server.ts?s=serveFile"
import * as uuid from "https://deno.land/std@0.119.0/uuid/mod.ts";

let sockets = []
const req_handler = async req => {

    const path = new URL (req.url).pathname

    const upgrade = req.headers.get ("upgrade") || ""

    if (upgrade.toLowerCase() == "websocket") {
        console.log (`websocket called`)
        const { socket, response } = Deno.upgradeWebSocket (req)
        console.log (socket)

        const socketId = uuid.v2.generate()
        socket.onopen = () => {
            console.log("socket opened");
            sockets.push({
                socket,
                socketId
            })
        }
        socket.onmessage = (e) => {
          console.log("socket message:", e.data);
          if(e.type === "control"){
              sockets.forEach(socket => socket.socket.send(e))
          }else{
              socket.send(new Date().toString());
          }
        };
        socket.onerror = (e) => console.log("socket errored:", e.message);
        socket.onclose = () => {
            sockets = sockets.filter(socket => socket.socketId !== socketId);
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
