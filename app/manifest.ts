import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "monityai.com",
    short_name: "monityai",
    description: "The smartest way to track expenses. Powered by AI.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0D9488",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/favicon.ico",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
