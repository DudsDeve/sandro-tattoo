import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { artist, post, product, quizQuestion, tattoo, testimonial } from "./schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export default defineConfig({
  name: "sandro-tattoo",
  title: "Sandro Tattoo CMS",
  projectId,
  dataset,
  basePath: "/studio",
  plugins: [structureTool()],
  schema: {
    types: [artist, tattoo, post, product, testimonial, quizQuestion],
  },
});
