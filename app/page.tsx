'use client';

import React, { useState, useEffect, useReducer, useRef, useCallback } from 'react';

// Import the main component
import { SpecialZoomLevel, ViewMode, Viewer, Worker } from '@react-pdf-viewer/core';
// Import plugins: I'm not sure if this is the best way to import plugins
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { searchPlugin } from '@react-pdf-viewer/search';
import { highlightPlugin } from '@react-pdf-viewer/highlight';
import jumpToPagePlugin from '@/components/documents/jumpToPagePlugin';

// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
// Import styles

import styles from '@/styles/Home.module.css';

// @todo: add support for math expressions
import remarkGfm from 'remark-gfm';
import RemarkMathPlugin from 'remark-math';
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

// @ts-ignore
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

import { useCredentialsCookie } from "@/context/credentials-context"
import { useToast } from "@/hooks/use-toast"
import { Check, Loader2, UploadCloud } from "lucide-react"
import { useDropzone } from "react-dropzone"

// @ts-ignore
const fetcher = (...args: any) => fetch(...args).then(res => res.json())

import { Document } from 'langchain/document';
import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { uploadToSubabase, Document as SupabaseDocument, supabaseClient } from '@/lib/supabase';
import { Message, reducer } from '@/lib/chat';
import ScrollToBottom from 'react-scroll-to-bottom';


const Page = () => {
  const [canUpload, setCanUpload] = useState(false);
  const [files, setFiles] = useState(null)
  const { cookieValue } = useCredentialsCookie()
  const { toast } = useToast()
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // @todo: add support for multiple files
    maxFiles: 1,
    accept: {
      "application/pdf": [".pdf"],
    },
  })
  const ButtonLoading = () => {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </Button>
    )
  }

  const searchPluginInstance = searchPlugin();
  const jumpToPagePluginInstance = jumpToPagePlugin();
  const highlightPluginInstance = highlightPlugin();
  const { jumpToPage } = jumpToPagePluginInstance;
  const { highlight } = searchPluginInstance;
  const [state, dispatch] = useReducer(reducer, {
    messages: [
      {
        name: 'system',
        // text: 'Act as an expert. Use markdown, katex, remark-math and gfm syntax when applicable. wrap math expression using $$.',
        text: 'Act as an expert. Reply to questions about this document. Self reflect on your answers.',
      }
    ],
    assistantThinking: false,
    isWriting: false,
    controller: null,
  });
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [document, setDocument] = useState<SupabaseDocument>(null);
  const [publicUrl, setPublicUrl] = useState(null);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    sourceDocs?: Document[];
  }>({
    messages: [
      {
        text: 'Hi, what would you like to learn about this document?',
        name: 'ai',
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const uploadFiles = async () => {
    setLoading(true);
    try {
      // @ts-ignore
      const [file] = files
      const uploadData: any = await uploadToSubabase(file, cookieValue.supabaseUrl, cookieValue.supabaseKey, cookieValue.supabaseBucket);
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: uploadData.path,
          // @ts-ignore
          name: file.name,
          // Add any other associated data here
          ...cookieValue
        })
      });
      setLoading(false);
      if (!res.ok) throw new Error(res.statusText);

      const { data } = await res.json();
      console.log('uploadFiles', data);
      // navigate to the new document page
      setDocument(data);
      return data; // Here you can return the data you get from the server if you wish
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();
    if (textAreaRef && textAreaRef.current) {
      const prompt = textAreaRef.current.value;
      if (prompt !== "") {
        setQuery(prompt.trim());
        setError(null);

        if (!query) {
          alert('Please input a question');
          return;
        }

        setLoading(true);
        const controller = new AbortController();
        const signal = controller.signal;
        dispatch({ type: "addMessage", payload: { prompt, controller } });
        setQuery('');

        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            signal: signal,
            body: JSON.stringify({
              ...cookieValue,
              prompt,
              messages: state.messages,
              id: document.id,
            }),
          });
          const data = res.body;
          if (!data) {
            return;
          }

          const reader = data.getReader();
          const decoder = new TextDecoder();
          let done = false;

          while (!done) {
            const { value, done: doneReading } = await reader.read();
            done = doneReading;

            const chunkValue = decoder.decode(value);
            dispatch({ type: "updatePromptAnswer", payload: chunkValue });
          }
          if (done) {
            // retrieve document sources
            const res = await fetch('/api/sources', {
              method: 'POST',
              body: JSON.stringify({
                prompt,
                messages: state.messages,
                id: document.id,
                ...cookieValue,
              }),
            });
            const { sources } = await res.json();
            if (sources) {
              dispatch({ type: "appendSourceDocs", payload: sources });
            }
            dispatch({ type: "done" });
          }

          setLoading(false);

          //scroll to bottom
          messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
        } catch (error) {
          setLoading(false);
          setError('An error occurred while fetching the data. Please try again.');
          console.log('error', error);
        }
      }
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };


  useEffect(() => {
    const fetchDocument = async () => {
      if (document && document.id && cookieValue) {
        const supabase = supabaseClient(cookieValue.supabaseUrl, cookieValue.supabaseKey);
        const url: any = supabase
          .storage
          .from(cookieValue.supabaseBucket || 'public')
          .getPublicUrl(document.url)
        setPublicUrl(url.data.publicUrl);
        setDocument(document);
      }
    };
    fetchDocument();
  }, [document, cookieValue]);

  return (
    <section className="container grid grid-cols-2 items-center gap-6 pb-8 pt-6 md:py-10">
      {!document && <div className="min-w-1/5 flex flex-col items-start gap-2">
        <h2 className="mt-10 scroll-m-20 pb-2 text-2xl font-semibold tracking-tight transition-colors first:mt-0">
          Upload your PDF
        </h2>
        <div
          className="min-w-full rounded-md border border-slate-200 p-0 dark:border-slate-700"
          {...getRootProps()}
        >
          <div className="flex min-h-[150px] cursor-pointer items-center justify-center p-10">
            <input {...getInputProps()} />

            {files ? (
              <ul>
                {files.map((file) => (
                  <li key={file.name}>* {file.name}</li>
                ))}
              </ul>
            ) : (
              <>
                {isDragActive ? (
                  <p>Drop your PDF here ...</p>
                ) : (
                  <p>
                    Drag and drop your PDF here, or click to
                    select file
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <div className="self-start">
          {loading ? <ButtonLoading /> :
            <Button
              type="submit"
              disabled={
                !files ||
                loading ||
                !cookieValue.openaiApiKey ||
                !cookieValue.pineconeEnvironment ||
                !cookieValue.pineconeIndex ||
                !cookieValue.pineconeApiKey ||
                !cookieValue.supabaseUrl ||
                !cookieValue.supabaseKey ||
                !cookieValue.supabaseBucket ||
                !cookieValue.supabaseDatabaseUrl ||
                !cookieValue.supabaseDirectUrl
              }
              className="mt-2"

              onClick={uploadFiles}
            >
              {!canUpload && <UploadCloud className="mr-2 h-4 w-4" />}
              {canUpload && <Check className="mr-2 h-4 w-4" />}
              Let&apos;s chat
            </Button>}
        </div>

        <div>
          This app requires you to{" "}
          <Link
            className="cursor-pointer text-blue-500 hover:text-blue-700 hover:underline"
            href="/credentials"
            rel="noreferrer"
          >
            add your credentials
          </Link>{" "}
          to work properly.
        </div>
      </div>}
      {document && <div style={{
        border: '1px solid rgba(0, 0, 0, 0.3)',
        height: '93vh',
      }} className="max-w max-h flex flex-col items-center justify-center rounded text-center shadow-md">

        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.6.172/build/pdf.worker.js">

          {publicUrl && <Viewer theme={{
            theme: 'auto'
          }} defaultScale={SpecialZoomLevel.PageWidth} viewMode={ViewMode.SinglePage} initialPage={0} plugins={[defaultLayoutPluginInstance, jumpToPagePluginInstance, highlightPluginInstance, searchPluginInstance]} fileUrl={publicUrl} />}
        </Worker>

      </div>}
      <div className="max-w max-h  flex flex-col justify-center rounded">
        <div className="transition-width font-default relative mx-auto flex h-full w-full max-w-3xl flex-1 flex-col items-stretch overflow-hidden pb-12">

          <div className={styles.cloud}>
          <ScrollToBottom
                  className="relative w-full h-full"
                  scrollViewClassName="h-full w-full overflow-y-auto"

                >
              <div className="transition-width flex w-full flex-1 flex-col items-stretch">
                <div className="flex-1">
                  <div className="prose prose-lg prose-invert flex flex-col">

                    <div ref={messageListRef} className={styles.messagelist}>
                      {/* @ts-ignore */}
                      {state.messages.filter(message => message.name != 'system').map((message, index) => {
                        let icon;
                        let className;
                        if (message.name === 'ai') {
                          icon = (
                            <Image
                              key={index}
                              src="/bot-image.png"
                              alt="AI"
                              width="40"
                              height="40"
                              className={styles.boticon}
                              priority
                            />
                          );
                          className = styles.apimessage;
                        } else {
                          icon = (
                            <Image
                              key={index}
                              src="/usericon.png"
                              alt="Me"
                              width="30"
                              height="30"
                              className={styles.usericon}
                              priority
                            />
                          );
                          // The latest message sent by the user will be animated while waiting for a response
                          className =
                            loading && index === messages.length - 1
                              ? styles.usermessagewaiting
                              : styles.usermessage;
                        }
                        function navigateToSource(pageNumber: number, content: string): void {
                          jumpToPage(pageNumber - 1);
                          const words = content.split(' ');
                          highlight({
                            matchCase: true,
                            keyword: content,
                            multiline: true
                          });
                        }

                        return (
                          <>
                            <div key={`chatMessage-${index}`} className={className}>
                              {icon}
                              <div className={styles.markdownanswer}>
                                <ReactMarkdown
                                  className="prose prose-lg" remarkPlugins={[remarkGfm, RemarkMathPlugin]} rehypePlugins={[rehypeKatex]} linkTarget="_blank">
                                  {message.text}
                                </ReactMarkdown>
                              </div>
                            </div>
                            {message.sourceDocs && (
                              <div
                                className="p-5"
                                key={`sourceDocsAccordion-${index}`}
                              >
                                {message.sourceDocs.map((doc, j) => (
                                  // @ts-ignore
                                  <Button key={`sourceDocsBtn-${j}`} onClick={(e) => navigateToSource(doc.metadata['loc.pageNumber'], doc.pageContent)} className="m-1" size={'sm'} variant="secondary">p. {doc.metadata['loc.pageNumber']}</Button>
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              </ScrollToBottom>
          </div>
          <div className={styles.center}>
            <div className={styles.cloudform}>
              <form onSubmit={handleSubmit}>
                <textarea
                  disabled={loading || !document}
                  onKeyDown={handleEnter}
                  ref={textAreaRef}
                  autoFocus={false}
                  rows={1}
                  maxLength={512}
                  id="userInput"
                  name="userInput"
                  placeholder={
                    loading
                      ? 'Waiting for response...'
                      : 'What is this document about?'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={styles.textarea}
                />
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className={styles.generatebutton}
                >
                  {loading ? (
                    <div className={styles.loadingwheel}>
                      <Spinner cx="animate-spin w-5 h-5 text-gray-400" />
                    </div>
                  ) : (
                    // Send icon SVG in input field
                    <svg
                      viewBox="0 0 20 20"
                      className={styles.svgicon}
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                    </svg>
                  )}
                </button>
              </form>
            </div>
          </div>
          {error && (
            <div className="rounded-md border border-red-400 p-4">
              <p className="text-red-500">{error}</p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
};


export default Page;
