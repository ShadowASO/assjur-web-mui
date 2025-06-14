import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

interface HighlighterProps {
  language: string;
  theme: {
    [key: string]: React.CSSProperties;
  };
  children: string | string[];
}
export const HighlighterCustomizado = ({
  language,
  theme,
  children,
}: HighlighterProps) => {
  return (
    <SyntaxHighlighter language={language} style={theme}>
      {children}
    </SyntaxHighlighter>
  );
};
