import { defineField, defineType } from "sanity";

export const artist = defineType({
  name: "artist",
  title: "Artista",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "role", type: "string" }),
    defineField({ name: "specialty", type: "string" }),
    defineField({
      name: "specialties",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({ name: "years", type: "number" }),
    defineField({ name: "bio", type: "text" }),
    defineField({ name: "bioLong", type: "text" }),
    defineField({ name: "instagram", type: "string" }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "works", type: "array", of: [{ type: "image" }] }),
    defineField({ name: "available", type: "boolean", initialValue: true }),
    defineField({
      name: "styleVector",
      type: "object",
      fields: [
        { name: "realismo", type: "number" },
        { name: "blackwork", type: "number" },
        { name: "fine-line", type: "number" },
        { name: "old-school", type: "number" },
        { name: "aquarela", type: "number" },
        { name: "oriental", type: "number" },
        { name: "dotwork", type: "number" },
        { name: "neo-tradicional", type: "number" },
      ],
    }),
  ],
});

export const tattoo = defineType({
  name: "tattoo",
  title: "Tattoo",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "artist", type: "reference", to: [{ type: "artist" }] }),
    defineField({ name: "style", type: "string" }),
    defineField({ name: "image", type: "image", options: { hotspot: true } }),
    defineField({ name: "hours", type: "number" }),
    defineField({ name: "bodyPart", type: "string" }),
  ],
});

export const post = defineType({
  name: "post",
  title: "Post",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "title" } }),
    defineField({ name: "excerpt", type: "text" }),
    defineField({ name: "category", type: "string", options: { list: ["cuidados", "tendencias", "bastidores", "estilo"] } }),
    defineField({ name: "date", type: "date" }),
    defineField({ name: "readTime", type: "string" }),
    defineField({ name: "cover", type: "image" }),
    defineField({ name: "content", type: "text" }),
  ],
});

export const product = defineType({
  name: "product",
  title: "Produto",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "slug", type: "slug", options: { source: "name" } }),
    defineField({ name: "price", type: "number" }),
    defineField({ name: "category", type: "string" }),
    defineField({ name: "image", type: "image" }),
    defineField({ name: "images", type: "array", of: [{ type: "image" }] }),
    defineField({ name: "description", type: "text" }),
    defineField({ name: "sizes", type: "array", of: [{ type: "string" }] }),
  ],
});

export const testimonial = defineType({
  name: "testimonial",
  title: "Depoimento",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string" }),
    defineField({ name: "text", type: "text" }),
    defineField({ name: "rating", type: "number" }),
    defineField({ name: "workImage", type: "image" }),
  ],
});

export const quizQuestion = defineType({
  name: "quizQuestion",
  title: "Pergunta do quiz",
  type: "document",
  fields: [
    defineField({ name: "prompt", type: "string" }),
    defineField({ name: "hint", type: "string" }),
    defineField({ name: "type", type: "string", options: { list: ["image", "text"] } }),
    defineField({
      name: "options",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            { name: "id", type: "string" },
            { name: "label", type: "string" },
            { name: "image", type: "image" },
            { name: "icon", type: "string" },
            { name: "weights", type: "text" },
          ],
        },
      ],
    }),
  ],
});
