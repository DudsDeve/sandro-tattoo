export const artistsQuery = `*[_type == "artist"] | order(years desc){
  "slug": slug.current, name, role, specialty, specialties, years, bio, bioLong, instagram,
  "image": image.asset->url, "works": works[].asset->url, styleVector, available
}`;

export const artistBySlugQuery = `*[_type == "artist" && slug.current == $slug][0]{
  "slug": slug.current, name, role, specialty, specialties, years, bio, bioLong, instagram,
  "image": image.asset->url, "works": works[].asset->url, styleVector, available
}`;

export const tattoosQuery = `*[_type == "tattoo"] | order(_createdAt desc){
  "id": _id, title, "artistSlug": artist->slug.current, "artistName": artist->name,
  style, "image": image.asset->url, hours, bodyPart
}`;

export const postsQuery = `*[_type == "post"] | order(date desc){
  "slug": slug.current, title, excerpt, category, date, readTime, "cover": cover.asset->url, content
}`;

export const productsQuery = `*[_type == "product"]{
  "slug": slug.current, name, price, category, "image": image.asset->url,
  "images": images[].asset->url, description, sizes
}`;
