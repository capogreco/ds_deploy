import { serve } from "https://deno.land/std@$STD_VERSION/http/server.ts";
import { serveDir } from "https://deno.land/std@$STD_VERSION/http/file_server.ts";

serve((req) => {
    const pathname = new URL(req.url).pathname;
    if (pathname.startsWith (`/`)) {
        return serveDir (req, {
            fsRoot: `${ Deno.cwd () }/public`,
        })
    }
    // Do dynamic responses
    return new Response();
});



// (import { serve } from "https://deno.land/std@0.140.0/http/server.ts";
// import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts"
// import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts"
// import { acceptWebSocket } from "https://deno.land/std@0.9/ws/mod.ts"

// // serve public
// const servePublic = req => staticFiles ('public') ({ 
//     request: req, 
//     respondWith: r => r 
// })

// // serve control
// const serveControl = req => staticFiles (`control`) ({ 
//     request: req, 
//     respondWith: r => r 
// })

// serve (req => {
//     const url = new URL(req.url);
//     console.log (url.pathname)

//     switch (url.pathname) {
//         case `/control`:
//             return serveControl (req)
//         case `/`:
//             return servePublic (req)
//     }
// }, { addr: ':80' })


// // serve((req) => serveControl (req), { addr: ':8000' })

// const wss = new WebSocketServer ()

// wss.on ("connection", function (ws) {

//     wss.clients.forEach (c => {
//         if (c.state == 3) wss.clients.delete (c)
//     })

//     // console.dir (`${ wss.clients.size } connections`)

//     ws.on ("message", msg => {
//         const obj = JSON.parse (msg)
//         // switch (obj.type) {
//         //     case `greeting`:
//         //         console.log (obj.body)
//         //         break
//         //     case `control`:
//         //         console.log (`control: ${ obj.body }`)
//         //         break
//         //     case `save`:
//         //         console.log (`saving to ${ obj.body }`)
//         //         break
//         //     case `load`:
//         //         console.log (`loading from ${ obj.body }`)
//         //         break
//         //     case `is_playing`:
//         //         console.log (`is playing? ${ obj.body }`)
//         // }
//         wss.clients.forEach (c => c.send (msg))
//     })
// })

