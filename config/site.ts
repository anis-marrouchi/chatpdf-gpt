export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "PDF Chat",
  description:
    "Chat with any pdf file, powered by Langchain, Pinecone, Supabase and OpenAI",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Documents",
      href: "/documents",
    },
    {
      title: "Credentials",
      href: "/credentials",
    },
    {
      title: "Github",
      href: "https://github.com/anis-marrouchi/chatpdf-gpt",
    },
  ],
  links: {
    twitter: "https://twitter.com/anis_marrouchi",
    github: "https://github.com/anis-marrouchi/chatpdf-gpt",
  },
}
