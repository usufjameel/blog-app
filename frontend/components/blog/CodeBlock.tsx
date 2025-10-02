"use client";

import { useToast } from "@/components/ui/use-toast";
import { useEffect, useRef } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  showLanguage?: boolean;
}

export function CodeBlock({
  code,
  language,
  showLanguage = true,
}: CodeBlockProps) {
  const { toast } = useToast();
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const loadPrism = async () => {
      if (typeof window !== "undefined") {
        const Prism = (await import("prismjs")).default;
        await import("prismjs/themes/prism-tomorrow.css");

        if (language) {
          try {
            await import(`prismjs/components/prism-${language}`);
          } catch (e) {
            // Language not available
          }
        }

        if (codeRef.current) {
          Prism.highlightElement(codeRef.current);
        }
      }
    };

    loadPrism();
  }, [code, language]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    toast({ title: "Code copied to clipboard!" });
  };

  return (
    <div className="mb-6 relative">
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 z-10 text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
      >
        Copy
      </button>
      <pre className="!bg-gray-900 rounded overflow-x-auto">
        <code
          ref={codeRef}
          className={`language-${language || "none"} text-sm`}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}
