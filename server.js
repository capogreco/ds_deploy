import { serve } from "https://deno.land/std@0.157.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.157.0/http/file_server.ts";

serve (req => serveDir (req, { fsRoot: `public`}))



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


