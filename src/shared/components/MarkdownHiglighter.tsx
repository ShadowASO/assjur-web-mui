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
    <section>
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
        }}
      >
        {children}
      </ReactMarkdown>
    </section>
  );
};

//export default MarkdownComponent;
