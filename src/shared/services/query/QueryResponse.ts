//Request:
// {
//     "id": "resp_67ccd2bed1ec8190b14f964abc0542670bb6a6b452d3795b",
//     "object": "response",
//     "created_at": 1741476542,
//     "status": "completed",
//     "error": null,
//     "incomplete_details": null,
//     "instructions": null,
//     "max_output_tokens": null,
//     "model": "gpt-4.1-2025-04-14",
//     "output": [
//       {
//         "type": "message",
//         "id": "msg_67ccd2bf17f0819081ff3bb2cf6508e60bb6a6b452d3795b",
//         "status": "completed",
//         "role": "assistant",
//         "content": [
//           {
//             "type": "output_text",
//             "text": "In a peaceful grove beneath a silver ",
//             "annotations": []
//           }
//         ]
//       }
//     ],
//     "parallel_tool_calls": true,
//     "previous_response_id": null,
//     "reasoning": {
//       "effort": null,
//       "summary": null
//     },
//     "store": true,
//     "temperature": 1.0,
//     "text": {
//       "format": {
//         "type": "text"
//       }
//     },
//     "tool_choice": "auto",
//     "tools": [],
//     "top_p": 1.0,
//     "truncation": "disabled",
//     "usage": {
//       "input_tokens": 36,
//       "input_tokens_details": {
//         "cached_tokens": 0
//       },
//       "output_tokens": 87,
//       "output_tokens_details": {
//         "reasoning_tokens": 0
//       },
//       "total_tokens": 123
//     },
//     "user": null,
//     "metadata": {}
//   }

import { useRef } from "react";

type TPromptType = string;

export type TRoleType = "developer" | "user" | "assistant";

export interface IMessageResponseItem {
  id: string;
  role: TRoleType;
  text: TPromptType;
}
export interface IOutputResponseItem {
  type: string;
  id: string;
  status: string;
  role: TRoleType;
  content: [
    {
      type: string;
      text: string;
      annotations: string[];
    }
  ];
}

export interface IUsageResponse {
  input_tokens: number;
  input_tokens_details: {
    cached_tokens: number;
  };
  output_tokens: number;
  output_tokens_details: {
    reasoning_tokens: number;
  };
  total_tokens: number;
}

export interface IResponseOpenaiApi {
  id: string;
  object: string;
  created: number;
  status: string;
  model: string;
  output: IOutputResponseItem[];
  usage: IUsageResponse;
}

export interface IResponseRAG {
  id: string;
  //object: string;
  //created: number;
  //status: string;
  //model: string;
  output: IOutputResponseItem[];
  //usage: IUsageResponse;
}

export function useMessageReponse() {
  const messagesRef = useRef<IMessageResponseItem[]>([]); // sempre atualizado

  function addMessage(id: string, role: TRoleType, text: string) {
    const newMessage = { id, role, text: text };

    messagesRef.current = [...messagesRef.current, newMessage];
  }
  function addOutput(output: IOutputResponseItem) {
    const newMessage = {
      id: output.id,
      role: output.role,
      text: output.content[0].text,
    };

    messagesRef.current = [...messagesRef.current, newMessage];
  }

  function getMessages() {
    return messagesRef.current;
  }

  function clearMessages() {
    messagesRef.current = [];
  }

  function getMessagesAsString(): string {
    return messagesRef.current
      .map(
        (msg) =>
          `\n\n**${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)}:** ${
            msg.text
          }`
      )
      .join("");
  }

  return {
    //messages,
    messagesRef,
    addMessage,
    addOutput,
    getMessages,
    clearMessages,
    getMessagesAsString,
  };
}
