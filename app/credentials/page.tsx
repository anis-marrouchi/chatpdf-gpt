'use client';
import React, { useState } from "react"
import Head from "next/head"
import Link from "next/link"
import { useCredentialsCookie } from "@/context/credentials-context"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { FileKey } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function CredentialsPage() {
  const { cookieValue, setAndSaveCookieValue } = useCredentialsCookie()
  const [openaiApiKey, setOpenaiApiKey] = useState(cookieValue.openaiApiKey)
  const [pineconeEnvironment, setPineconeEnvironment] = useState(
    cookieValue.pineconeEnvironment
  )
  const [pineconeIndex, setPineconeIndex] = useState(cookieValue.pineconeIndex)
  const [pineconeApiKey, setPineconeApiKey] = useState(
    cookieValue.pineconeApiKey
  )
  const [supabaseKey, setSupabaseKey] = useState(
    cookieValue.supabaseKey
  )
  const [supabaseUrl, setSupabaseUrl] = useState(
    cookieValue.supabaseUrl
  )
  const [supabaseDatabaseUrl, setSupabaseDatabaseUrl] = useState(
    cookieValue.supabaseDatabaseUrl
  )
  const [supabaseDirectUrl, setSupabaseDirectUrl] = useState(
    cookieValue.supabaseDirectUrl
  )

  const [supabaseBucket, setSupabaseBucket] = useState(
    cookieValue.supabaseBucket
  )


  const handleOpenaiApiKeyChange = (e) => {
    setOpenaiApiKey(e.target.value)
  }
  const handlePineconeEnvironmentChange = (e) => {
    setPineconeEnvironment(e.target.value)
  }
  const handlePineconeIndexChange = (e) => {
    setPineconeIndex(e.target.value)
  }
  const handlePineconeApiKeyChange = (e) => {
    setPineconeApiKey(e.target.value)
  }
  const handleSupabaseKeyChange = (e) => {
    setSupabaseKey(e.target.value)
  }
  const handleSupabaseUrlChange = (e) => {
    setSupabaseUrl(e.target.value)
  }
  const handleSupabaseBucketChange = (e) => {
    setSupabaseBucket(e.target.value)
  }
  const handleSupabaseDatabaseUrlChange = (e) => {
    setSupabaseDatabaseUrl(e.target.value)
  }
  const handleSupabaseDirectUrlChange = (e) => {
    setSupabaseDirectUrl(e.target.value)
  }



  const handleSaveCredentials = () => {
    setAndSaveCookieValue({
      openaiApiKey,
      pineconeEnvironment,
      pineconeIndex,
      pineconeApiKey,
      supabaseKey,
      supabaseUrl,
      supabaseBucket,
      supabaseDatabaseUrl,
      supabaseDirectUrl,
    })
  }

  return (
    <>
      <Head>
        <title>Credentials</title>
        <meta name="description" content="Add credentials" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <section className="container flex justify-items-stretch gap-6 pb-8 pt-6 md:py-10">
        <div className="flex flex-col items-start gap-2 ">
          <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
            Manage your API credentials
          </h2>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileKey className="mr-2 h-4 w-4" />
                Add Credentials
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Add credentials</DialogTitle>
                <DialogDescription>
                  Provide your API credentials before start using this app.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="openai-api-key" className="text-right">
                    OpenAI API Key
                  </Label>
                  <Input
                    id="openai-api-key"
                    value={openaiApiKey}
                    placeholder="sk-***************************"
                    className="col-span-3"
                    onChange={handleOpenaiApiKeyChange}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pinecone-api-key" className="text-right">
                    Pinecone API Key
                  </Label>
                  <Input
                    id="pinecone-api-key"
                    value={pineconeApiKey}
                    placeholder="*****-****-****"
                    className="col-span-3"
                    onChange={handlePineconeApiKeyChange}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pinecone-environment" className="text-right">
                    Pinecone Environment
                  </Label>
                  <Input
                    id="pinecone-environment"
                    value={pineconeEnvironment}
                    placeholder="us-west1-gcp"
                    className="col-span-3"
                    onChange={handlePineconeEnvironmentChange}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pinecone-index" className="text-right">
                    Pinecone Index Name
                  </Label>
                  <Input
                    id="pinecone-index"
                    value={pineconeIndex}
                    placeholder="book-gpt"
                    className="col-span-3"
                    onChange={handlePineconeIndexChange}
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supabase-key" className="text-right">
                    Supabase key
                  </Label>
                  <Input
                    id="supabase-key"
                    value={supabaseKey}
                    placeholder="***************************"
                    className="col-span-3"
                    onChange={handleSupabaseKeyChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supabase-url" className="text-right">
                    Supabase URL
                  </Label>
                  <Input
                    id="supabase-url"
                    value={supabaseUrl}
                    placeholder="***************************"
                    className="col-span-3"
                    onChange={handleSupabaseUrlChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supabase-bucket" className="text-right">
                    Supabase Bucket
                  </Label>
                  <Input
                    id="supabase-bucket"
                    value={supabaseBucket}
                    placeholder="your-bucket-name"
                    className="col-span-3"
                    onChange={handleSupabaseBucketChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supabase-database-url" className="text-right">
                    Supabase Database URL
                  </Label>
                  <Input
                    id="supabase-database-url"
                    value={supabaseDatabaseUrl}
                    placeholder="***************************"
                    className="col-span-3"
                    onChange={handleSupabaseDatabaseUrlChange}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="supabase-direct-url" className="text-right">
                    Supabase Direct URL
                  </Label>
                  <Input
                    id="supabase-direct-url"
                    value={supabaseDirectUrl}
                    placeholder="***************************"
                    className="col-span-3"
                    onChange={handleSupabaseDirectUrlChange}
                  />
                </div>
              </div>
              <DialogPrimitive.Close asChild>
                <Button onClick={handleSaveCredentials}>Save changes</Button>
              </DialogPrimitive.Close>
            </DialogContent>
          </Dialog>

          <div>
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
               Getting Started
            </h3>
            <p>
              This app requires API credentials to work. You can get these
              credentials from{" "}
              <Link
                className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                href="https://platform.openai.com/account/api-keys"
                target="_blank"
                rel="noreferrer"
              >
                Open AI
              </Link>{" "}
              ,{" "}
              <Link
                className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                href="https://app.pinecone.io/"
                target="_blank"
                rel="noreferrer"
              >
                Pinecone
              </Link>
              {" "}and{" "}
              <Link
                className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                href="https://app.supabase.io/"
                target="_blank"
                rel="noreferrer"
              >
                Supabase
              </Link>
            </p>
            <p>
              Once you have the credentials, you can add them to this app by
              clicking on the &quot;Add Credentials&quot; button above.
            </p>
          </div>

          <div>
            <h3 className="mt-10 scroll-m-20 pb-2 text-xl font-semibold tracking-tight transition-colors first:mt-0">
              How do I get my credentials?
            </h3>
            <ol className="p-4">
              <li>
                1. Create your {" "}
                <Link
                  className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                  href="https://platform.openai.com/account/api-keys"
                  target="_blank"
                  rel="noreferrer"
                >
                  OpenAI API key 
                </Link>
              </li>
              <li>
                2. Create your {" "}
                <Link
                  className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                  href="https://app.pinecone.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Pinecone API key
                </Link>
              </li>
              <li>
                3. Create a new index in Pinecone. You can name it whatever you
                want. For example, &quot;book-gpt&quot;.
              </li>
              <li>
                4. Create your {" "}
                <Link
                  className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
                  href="https://app.supabase.io/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Supabase project
                </Link>
                {" "}and retrieve your API key, URL, Database URL and Direct URL.
              </li>
            </ol>
          </div>
        </div>
      </section>
    </>
  )
}
