import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

interface MarkdownHighlighterProps {
  language: string;
  thema: {
    [key: string]: React.CSSProperties;
  };
  customStyle?: React.CSSProperties | undefined;
  children: string;
}
export const MarkdownHighlighter = ({
  language,
  thema,
  customStyle,
  children,
}: MarkdownHighlighterProps) => {
  return (
    <ReactMarkdown
      components={{
        code({ children }) {
          return (
            <SyntaxHighlighter
              language={language}
              style={thema}
              customStyle={customStyle}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          );
        },
        li: ({ ...props }) => (
          <li
            style={{
              marginBottom: "4px",
              paddingLeft: "4px",
            }}
            {...props}
          />
        ),
        p: ({ ...props }) => <p style={{ marginBottom: "8px" }} {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  );
};

//export default MarkdownComponent;
