
# ChatPDF-GPT

## Introduction

ChatPDF-GPT is an innovative project that harnesses the power of the [LangChain framework](https://js.langchain.com/docs/), a transformative tool for developing applications powered by language models. This unique application uses LangChain to offer a chat interface that communicates with PDF documents, driven by the capabilities of [OpenAI's language models](https://platform.openai.com/docs/introduction).

In this project, the language model is connected to other data sources and allows interaction with its environment, thus embodying the principles of the LangChain framework. Users can upload a PDF document, which is then processed and saved in [Pinecone](https://www.pinecone.io/), a vector database, and [Supabase storage](https://supabase.com/). Users can then chat with the uploaded PDF, with the AI utilizing the content of the document to engage in a meaningful conversation.

The project relies on the [Next.js](https://nextjs.org/) framework, a leading choice for creating robust, full-stack Web applications. The UI components are beautifully crafted using the [Radix UI library](https://www.radix-ui.com/) and styled with Tailwind CSS, based on the elegant template provided by [shadcn/ui](https://github.com/shadcn/ui).

## Features

1.  **Upload a PDF**: Users can upload a PDF document, which is then stored in Pinecone vector database and Supabase storage.
2.  **Chat with PDF**: The application processes the content of the PDF and allows users to engage in a conversation with the document using OpenAI API.
3.  **PDF Preview**: Users can preview the actual PDF document they are interacting with, using the powerful React component package, [@react-pdf-viewer](https://react-pdf-viewer.dev/).
4.  **List PDFs**: The application provides a list of all uploaded PDF documents stored in the Supabase database.
5.  **Delete a PDF**: Users have the ability to remove a document from the database.
6.  **Cite Sources**: The AI chat interface provides sources from the PDF for every reply, allowing users to navigate directly to the reference in the PDF.

## Usage Examples

ChatPDF-GPT is equipped with examples that illustrate various operations such as:

1.  Interacting with Pinecone: saving embeddings, deleting a record.
2.  Uploading a file to Supabase storage and also deleting a file.
3.  Listing available documents from Supabase database.
4.  Previewing a PDF using the @react-pdf-viewer.
5.  Navigating directly to the source of an AI reply in the PDF.

## Quick Testing Using the Demo

To test the functionality of this project using the demo, you will need to provide your own credentials for OpenAI, Supabase, and Pinecone. Please consult the corresponding documentation to acquire these:

1.  [OpenAI](https://platform.openai.com/docs/guides/authentication)
2.  [Supabase](https://supabase.com/docs/guides/platform)
3.  [Pinecone](https://www.pinecone.io/docs/)

## Setup and Installation

To set up and run ChatPDF-GPT on your local machine, follow the steps below:

1.  Clone the project repository:
    
    ```
    git clone https://github.com/anis-marrouchi/chatpdf-gpt.git
    ``` 
    
2.  Navigate into the project directory and install the dependencies using [pnpm](https://pnpm.io/):
    
  ```
  cd chatpdf-gpt
pnpm install
```
    
3.  Create a `.env` file in the root directory and fill in your credentials (OpenAI, Pinecone, Supabase) as indicated in the `.env.example` file.

4. Create the database schema using Prisma. You must make you have run the prisma generate command `prisma generate`
    
    ```
    npx prisma migrate dev --name init
    ```

5.  Start the server:
  
    ```
    npm run dev
    ```

## Contribution

ChatPDF-GPT is an open-source project and we warmly welcome contributions from everyone. Please read our [contributing guide](https://chat.openai.com/CONTRIBUTING.md) for more details on how to get started.

## Credits


This project stands on the shoulders of giants. Our work would not be possible without the vast array of libraries, frameworks, and tools that the open source community has produced. Specifically, we would like to express our appreciation to:

1.  The [LangChain](https://js.langchain.com/docs/) team for their groundbreaking framework for applications powered by language models.
    
2.  [OpenAI](https://openai.com/) for their state-of-the-art language models, which make the chat functionality possible.
    
3.  [Supabase](https://supabase.com/) for their open-source Firebase alternative which we used to build secure and performant backends.
    
4.  [Pinecone](https://www.pinecone.io/) for their vector database that allows easy and efficient storage and retrieval of vector embeddings.
    
5.  [Next.js](https://nextjs.org/) and [Vercel](https://vercel.com/) for their comprehensive framework which allowed us to build this full-stack Web application with ease.
    
6.  [shadcn](https://github.com/shadcn) for their elegant UI components which we built upon to create a beautiful and user-friendly interface.
    
7.  [Radix UI](https://www.radix-ui.com/) for their robust, accessible and customizable component library that forms the backbone of our UI.
    
8.  [@react-pdf-viewer](https://react-pdf-viewer.dev/) for their powerful React component, which lets users preview the actual PDF document they are interacting with.
    

And all the other dependencies, both listed and not listed, that contributed to the realization of this project. Our contribution is modest in comparison to their collective effort.

## License

ChatPDF-GPT is open-source software licensed under the [MIT license](https://chat.openai.com/LICENSE.md).