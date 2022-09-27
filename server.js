import { serve } from "https://deno.land/std@0.157.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.157.0/http/file_server.ts";

const req_handler = async (req, con) => {
    // const { pathname: path } = new URL(req.url)
    const path = new URL (req.url).pathname

    switch (path) {
        case "/control":
            return new Response ("this is control", { status: 404 });
        case "/":
            return new Response ("this is public", { status: 404 });
        }

    return new Response ("hello hello")
}

serve (req_handler, { port: 80 })


// serve (req => serveDir (req, { fsRoot: "public" }))

// serve((req) => {
//     const pathname = new URL(req.url).pathname;
//     if (pathname.startsWith (`/`)) {
//         return serveDir (req, {
//             fsRoot: `public`,
//         })
//     }
//     // Do dynamic responses
//     return new Response();
// });


