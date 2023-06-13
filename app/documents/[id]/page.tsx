'use client';

import React,{ useState, useEffect, useReducer, useRef, KeyboardEvent, useCallback } from 'react';

import useSWR, { mutate } from 'swr';
import { createClient } from '@supabase/supabase-js'
// Import the main component
import { LocalizationMap, SpecialZoomLevel, ViewMode, Viewer } from '@react-pdf-viewer/core';
// Import the localization file
import ar_AE from '@react-pdf-viewer/locales/lib/ar_AE.json';
// Import the styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

import { Worker } from '@react-pdf-viewer/core';
import styles from '@/styles/Home.module.css';
import ScrollToBottom from "react-scroll-to-bottom";
import remarkGfm from 'remark-gfm';
import RemarkMathPlugin from 'remark-math';
// @ts-ignore
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { searchPlugin } from '@react-pdf-viewer/search';

// Import styles
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import  jumpToPagePlugin  from '@/components/documents/jumpToPagePlugin';

// @ts-ignore
const fetcher = (...args: any) => fetch(...args).then(res => res.json())
// Create a single supabase client for interacting with your database
import { uploadToSubabase, Document as SupabaseDocument, supabaseClient } from '@/lib/supabase';
import { Document } from 'langchain/document';
import Spinner from '@/components/ui/Spinner';
import { Button } from '@/components/ui/button';
import { highlightPlugin } from '@react-pdf-viewer/highlight';
import '@react-pdf-viewer/highlight/lib/styles/index.css';
import { Message, reducer } from '@/lib/chat';
import { useCredentialsCookie } from '@/context/credentials-context';

const Page = ({ params }: {
  params: { id: string }
}) => {
  const { cookieValue } = useCredentialsCookie()

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
  const { id } = params;
  const { data: doc, error: docError } = useSWR(`/api/documents/${id}`, fetcher);
  const [publicUrl, setPublicUrl] = useState(null);
  const [document, setDocument] = useState([]);
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

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  function containsArabic(text: string) {
    const arabicRegEx = /[\u0600-\u06FF]/;
    return arabicRegEx.test(text);
}

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
              prompt,
              messages: state.messages,
              id,
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
                id,
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
          if (doc && cookieValue) {
            const supabase = supabaseClient(cookieValue.supabaseUrl, cookieValue.supabaseKey);
            const url: any = supabase
              .storage
              .from(cookieValue.supabaseBucket || 'public')
              .getPublicUrl(doc.data.url)
            setPublicUrl(url.data.publicUrl);
            setDocument(doc);
          }
        };
        fetchDocument();
      }, [doc, cookieValue]);

      return (
        <section className="container grid grid-cols-2 items-center gap-6 pb-8 pt-6 md:py-10">
          <div style={{
            border: '1px solid rgba(0, 0, 0, 0.3)',
            height: '93vh',
          }} className="max-w max-h col-span-2  flex flex-col items-center justify-center rounded text-center shadow-md md:col-span-1">

            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.6.172/build/pdf.worker.js">

              {publicUrl && <Viewer theme={{
                theme: 'auto'
              }} defaultScale={SpecialZoomLevel.PageWidth} viewMode={ViewMode.SinglePage} initialPage={0} localization={ar_AE as unknown as LocalizationMap} plugins={[defaultLayoutPluginInstance, jumpToPagePluginInstance, highlightPluginInstance, searchPluginInstance]} fileUrl={publicUrl} />}
            </Worker>


          </div>
          <div  className="max-w max-h col-span-2  flex flex-col justify-center rounded md:col-span-1">
            <div className="transition-width font-default relative mx-auto flex h-full w-full max-w-3xl flex-1 flex-col items-stretch overflow-hidden pb-12">

              <div className={styles.cloud}>
                <ScrollToBottom
                  className="relative w-full h-full"
                  scrollViewClassName="h-full w-full overflow-y-auto"

                >
                              <div className="w-full transition-width flex flex-col items-stretch flex-1">
              <div className="flex-1">
                <div className="flex flex-col prose prose-lg prose-invert">

                  <div ref={messageListRef} className={styles.messagelist}>
                    {state.messages.filter((message: any) => message.name != 'system').map((message, index) => {
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
                        jumpToPage(pageNumber - 1 );
                        const words = content.split(' ');
                          highlight({
                            matchCase: true,
                            keyword: content,
                            multiline: true
                          });
                      }

                      return (
                        <>
                          <div dir={containsArabic(message.text)? 'rtl': 'ltr'} key={`chatMessage-${index}`} className={className}>
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
                      disabled={loading}
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
