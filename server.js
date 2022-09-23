import { serve } from "https://deno.land/std@$STD_VERSION/http/server.ts";
import { serveDir } from "https://deno.land/std@$STD_VERSION/http/file_server.ts";

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


serve (req => serveDir (req, { fsRoot: `public`}))