import { serve } from "https://deno.land/std@0.157.0/http/server.ts"
import { serveFile } from "https://deno.land/std@0.157.0/http/file_server.ts?s=serveFile"

const req_handler = async (req, con) => {
    const path = new URL (req.url).pathname

    switch (path) {
        case "/control":
            return serveFile (req, `control/index.html`)
        case "/":
            return serveFile (req, `public/index.html`)
        }

    return new Response ("hello hello")
}

serve (req_handler, { port: 80 })
