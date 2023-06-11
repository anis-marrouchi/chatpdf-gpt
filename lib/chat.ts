export interface Message {
  name: "human" | "ai" | "system";
  text: string;
  sourceDocs?: Document[];
}

export interface AppState {
  messages: Message[] | [];
  assistantThinking: boolean;
  isWriting: boolean;
  controller: AbortController | null;
}

export type AddMessage = {
  type: "addMessage";
  payload: { prompt: string; controller: AbortController };
};
export type UpdatePromptAnswer = { type: "updatePromptAnswer"; payload: string };
export type AppendSourceDocs = { type: "appendSourceDocs"; payload: Document[] };
export type Abort = { type: "abort" };
export type Done = { type: "done" };
export type AppActions = AddMessage | UpdatePromptAnswer | AppendSourceDocs | Abort | Done;
export function reducer(state: AppState, action: AppActions): AppState {
  switch (action.type) {
    case "addMessage":
      return {
        ...state,
        assistantThinking: true,
        messages: [
          ...state.messages,
          { name: "human", text: action.payload.prompt },
          { name: "ai", text: "" },
        ],
        controller: action.payload.controller,
      };
    case "appendSourceDocs":
       let _conversationListCopy = [...state.messages];
      const _lastIndex = _conversationListCopy.length - 1;
      _conversationListCopy[_lastIndex] = {
        ..._conversationListCopy[_lastIndex],
        sourceDocs: action.payload,
      };
      return {
        ...state,
        messages: _conversationListCopy,
      }
    case "updatePromptAnswer":
      const conversationListCopy = [...state.messages];
      const lastIndex = conversationListCopy.length - 1;
      conversationListCopy[lastIndex] = {
        ...conversationListCopy[lastIndex],
        text: conversationListCopy[lastIndex].text + action.payload,
      };

      return {
        ...state,
        assistantThinking: false,
        isWriting: true,
        messages: conversationListCopy,
      };
    case "abort":
      state.controller?.abort();
      return {
        ...state,
        isWriting: false,
        assistantThinking: false,
        controller: null,
      };
    case "done":
      return {
        ...state,
        isWriting: false,
        assistantThinking: false,
        controller: null,
      };
    default:
      return state;
  }
}