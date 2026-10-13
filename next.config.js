/** @type {import('next').NextConfig} */
module.exports = {
  // Static export for Cloudflare Pages: `next build` writes the site to ./out.
  // Security headers live in public/_headers; the API lives in functions/.
  output: "export",
};