'use client';
import { createContext, useContext, useEffect, useState } from "react"
// import { cookies } from 'next/headers' // @todo: refactor to use this
import cookies from "js-cookie"

const credentials_cookie_key = "credentials"
const initialCredentials = {
  openaiApiKey: process.env.OPENAI_API_KEY,
  pineconeEnvironment: process.env.PINECONE_ENVIRONMENT,
  pineconeBucket: process.env.PINECONE_BUCKET_NAME,
  pineconeIndex: process.env.PINECONE_INDEX_NAME,
  pineconeApiKey: process.env.PINECONE_API_KEY,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseKey: process.env.SUPABASE_KEY,
  supabaseBucket: process.env.SUPABASE_BUCKET,
  supabaseDatabaseUrl: process.env.DATABASE_URL,
  supabaseDirectUrl: process.env.DIRECT_URL,
}

const CredentialsCookieContext = createContext({
  cookieValue: null,
  setAndSaveCookieValue: null,
})

// Sorry for the mess, I'm in a hurry
export function CredentialsCookieProvider({ children }) {
  const [cookieValue, setCookieValue] = useState(initialCredentials)
  const setCookieForInitialNonEmptyValue = () => {
    // set cookie for key with a value in cookieValue
    const nonEmptCookieValue = {}
    for (const [key, value] of Object.entries(cookieValue)) {
      if (value) {
        nonEmptCookieValue[key] = value
      }
    }
    // check if nonEmptCookieValue is empty
    if (Object.keys(nonEmptCookieValue).length > 0) {
      cookies.set(credentials_cookie_key, JSON.stringify(nonEmptCookieValue), { expires: 7 })
    }
  }

  useEffect(() => {
    if (cookieValue) {
      setCookieForInitialNonEmptyValue()
    }
  }
    , [cookieValue])

  useEffect(() => {
    const valuesFromCookie = cookies.get(credentials_cookie_key)

    if (valuesFromCookie) {
      setCookieValue(JSON.parse(valuesFromCookie))
    }
  }, [])

  const setAndSaveCookieValue = (value) => {
    cookies.set(credentials_cookie_key, JSON.stringify(value), { expires: 7 })
    setCookieValue(value)
  }

  return (
    <CredentialsCookieContext.Provider
      value={{ cookieValue, setAndSaveCookieValue }}
    >
      {children}
    </CredentialsCookieContext.Provider>
  )
}

export function useCredentialsCookie() {
  return useContext(CredentialsCookieContext)
}
