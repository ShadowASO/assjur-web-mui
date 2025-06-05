//Request:
// {
//   "messages": [
//     {
//       "role": "user",
//       "content": [
//         {
//           "type": "text",
//           "text": "oi"
//         }
//       ]
//     }
//   ]
// }
//Response:
// {
//   "id": "chatcmpl-A6TeVz8woaT07oKxmbsNUw2XG7Eoa",
//   "object": "chat.completion",
//   "created": 1726107315,
//   "model": "gpt-4o-mini-2024-07-18",
//   "choices": [
//     {
//       "index": 0,
//       "message": {
//         "role": "assistant",
//         "content": "Oi! Como posso ajudar você hoje?",
//         "refusal": null
//       },
//       "logprobs": null,
//       "finish_reason": "stop"
//     }
//   ],
//   "usage": {
//     "prompt_tokens": 8,
//     "completion_tokens": 8,
//     "total_tokens": 16
//   },
//   "system_fingerprint": "fp_483d39d857"
// }

import { useRef } from "react";

// interface Prompt {
// 	type: string;
// 	text: string;
// }

/**
 * *************************************************************************
 * Classe que encapsula a manipulação das mensagens a serem enviadas pela API
 * da OpenAI numa geração de texto.
 * *************************************************************************
 */
export class ClassMessagesOpenai {
  private messages: IMessageOpenai[] = [];

  addMessage(role: TRoleType, text: string) {
    this.messages.push({
      role: role,
      content: text,
    });
  }
  //Devolve o vetor de mensagens
  getMessages() {
    return this.messages;
  }

  // Limpa todas as mensagens armazenadas
  clearMessages() {
    this.messages = [];
  }
  // Retorna as mensagens formatadas como string
  getMessagesAsString(): string {
    let txtMsgs = "";
    for (let i = 0; i < this.messages.length; i++) {
      const msg = this.messages[i];
      txtMsgs += `\n\n**${
        msg.role.charAt(0).toUpperCase() + msg.role.slice(1)
      }:** ${msg.content}`;
    }
    return txtMsgs;
  }
}

type TPromptType = string;

export type TRoleType = "developer" | "user" | "assistant";

export interface IMessageOpenai {
  role: TRoleType;
  content: TPromptType;
}
export interface IChoiceOpenai {
  index: number;
  message: {
    role: TRoleType;
    content: string;
    refusal: null;
  };
  logprobs: null;
  finish_reason: string;
}
export interface IUsageOpenai {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface IRespostaOpenai {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: IChoiceOpenai[];
  usage: IUsageOpenai;
}

export function useQueryGPT() {
  //const [messages, setMessages] = useState<IMessageOpenai[]>([]);
  const messagesRef = useRef<IMessageOpenai[]>([]); // sempre atualizado

  function addMessage(role: TRoleType, text: string) {
    const newMessage = { role, content: text };
    // setMessages((prev) => {
    //   const updated = [...prev, newMessage];
    //   return updated;
    // });
    messagesRef.current = [...messagesRef.current, newMessage];
  }

  function getMessages() {
    return messagesRef.current;
  }

  function clearMessages() {
    // setMessages([]);
    messagesRef.current = [];
  }

  function getMessagesAsString(): string {
    return messagesRef.current
      .map(
        (msg) =>
          `\n\n**${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:** ${
            msg.content
          }`
      )
      .join("");
  }

  return {
    //messages,
    messagesRef,
    addMessage,
    getMessages,
    clearMessages,
    getMessagesAsString,
  };
}
