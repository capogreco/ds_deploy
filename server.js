import { serve } from "https://deno.land/std@0.116.0/http/server.ts"
import { WebSocketServer } from "https://deno.land/x/websocket@v0.1.4/mod.ts"
import staticFiles from "https://deno.land/x/static_files@1.1.6/mod.ts"

// serve public
const servePublic = req => staticFiles ('public') ({ 
    request: req, 
    respondWith: r => r 
})

// serve control
const serveControl = req => staticFiles ('control') ({ 
    request: req, 
    respondWith: r => r 
})

serve (req => {
    // return req => staticFiles ('public') ({ 
    //     request: req, 
    //     respondWith: r => r 
    // })
    return servePublic (req)
    // switch (req.url) {
    //     case `https://capogreco-ds-deploy.deno.dev/control/`:
    //         return serveControl (req)
    //     case `https://capogreco-ds-deploy.deno.dev/`:
    //         return servePublic (req)        
    // }
}, { addr: ':80' })


// serve((req) => serveControl (req), { addr: ':8000' })

// const wss = new WebSocketServer ()

// wss.on ("connection", function (ws) {

//     wss.clients.forEach (c => {
//         if (c.state == 3) wss.clients.delete (c)
//     })

//     console.dir (`${ wss.clients.size } connections`)

//     ws.on ("message", msg => {
//         const obj = JSON.parse (msg)
//         switch (obj.type) {
//             case `greeting`:
//                 console.log (obj.body)
//                 break
//             case `control`:
//                 console.log (`control: ${ obj.body }`)
//                 break
//             case `save`:
//                 console.log (`saving to ${ obj.body }`)
//                 break
//             case `load`:
//                 console.log (`loading from ${ obj.body }`)
//                 break
//             case `is_playing`:
//                 console.log (`is playing? ${ obj.body }`)
//         }
//         wss.clients.forEach (c => c.send (msg))
//     })
// })

