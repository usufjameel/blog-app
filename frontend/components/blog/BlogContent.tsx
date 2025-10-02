"use client";

import { CodeBlock } from "./CodeBlock";

interface Section {
  id: string;
  type: "text" | "image" | "header" | "subheader" | "two-column" | "code";
  layout: "single" | "double";
  content: string;
  imageUrl?: string;
  leftContent?: string;
  rightContent?: string;
  leftImageUrl?: string;
  rightImageUrl?: string;
  language?: string;
  textColor?: string;
  fontSize?: string;
  isBulletList?: boolean;
  listStyle?: string;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  isStrikethrough?: boolean;
  // Left column specific properties
  leftTextColor?: string;
  leftFontSize?: string;
  leftIsBulletList?: boolean;
  leftListStyle?: string;
  leftIsBold?: boolean;
  leftIsItalic?: boolean;
  leftIsUnderline?: boolean;
  leftIsStrikethrough?: boolean;
  // Right column specific properties
  rightTextColor?: string;
  rightFontSize?: string;
  rightIsBulletList?: boolean;
  rightListStyle?: string;
  rightIsBold?: boolean;
  rightIsItalic?: boolean;
  rightIsUnderline?: boolean;
  rightIsStrikethrough?: boolean;
}

interface BlogContentProps {
  content: string;
}

export function BlogContent({ content }: BlogContentProps) {
  let sections: Section[] = [];

  try {
    sections = JSON.parse(content);
  } catch {
    // Fallback to markdown if not JSON
    return (
      <div className="prose max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, "<br>") }}
        />
      </div>
    );
  }

  const renderSection = (section: Section) => {
    switch (section.type) {
      case "header":
        return <h1 className="text-3xl font-bold mb-6">{section.content}</h1>;
      case "subheader":
        return (
          <h2 className="text-2xl font-semibold mb-4">{section.content}</h2>
        );
      case "text":
        const textStyle = {
          color: section.textColor || "inherit",
          fontSize: section.fontSize || "inherit",
          fontWeight: section.isBold ? "bold" : "normal",
          fontStyle: section.isItalic ? "italic" : "normal",
          textDecoration:
            `${section.isUnderline ? "underline" : ""} ${
              section.isStrikethrough ? "line-through" : ""
            }`.trim() || "none",
        };

        if (section.isBulletList) {
          const listStyleType = {
            "list-disc": "disc",
            "list-decimal": "decimal",
            "list-lower-alpha": "lower-alpha",
            "list-upper-alpha": "upper-alpha",
            "list-lower-roman": "lower-roman",
            "list-upper-roman": "upper-roman",
          }[section.listStyle || "list-disc"];

          const listStyle = {
            listStyleType,
            marginLeft: "2rem",
            paddingLeft: "0.5rem",
            marginBottom: "1.5rem",
            color: section.textColor || "inherit",
            fontSize: section.fontSize || "inherit",
            fontWeight: section.isBold ? "bold" : "normal",
            fontStyle: section.isItalic ? "italic" : "normal",
            textDecoration:
              `${section.isUnderline ? "underline" : ""} ${
                section.isStrikethrough ? "line-through" : ""
              }`.trim() || "none",
          };

          const listItemStyle = {
            color: section.textColor || "inherit",
          };

          const formatInlineText = (text: string) => {
            return text
              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
              .replace(/\*(.*?)\*/g, "<em>$1</em>")
              .replace(/__(.*?)__/g, "<u>$1</u>")
              .replace(/~~(.*?)~~/g, "<del>$1</del>")
              .replace(
                /\{\{large:(.*?)\}\}/g,
                '<span style="font-size: 1.25em">$1</span>'
              )
              .replace(
                /\{\{small:(.*?)\}\}/g,
                '<span style="font-size: 0.875em">$1</span>'
              )
              .replace(
                /\[(.*?)\]\((.*?)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
              );
          };

          return (
            <ul className="leading-relaxed" style={listStyle}>
              {section.content
                .split("\n")
                .filter((line) => line.trim())
                .map((line, i) => (
                  <li
                    key={i}
                    className="mb-2"
                    style={listItemStyle}
                    dangerouslySetInnerHTML={{
                      __html: formatInlineText(line.trim()),
                    }}
                  />
                ))}
            </ul>
          );
        }

        const formatInlineText = (text: string) => {
          return text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/__(.*?)__/g, "<u>$1</u>")
            .replace(/~~(.*?)~~/g, "<del>$1</del>")
            .replace(
              /\{\{large:(.*?)\}\}/g,
              '<span style="font-size: 1.25em">$1</span>'
            )
            .replace(
              /\{\{small:(.*?)\}\}/g,
              '<span style="font-size: 0.875em">$1</span>'
            )
            .replace(
              /\[(.*?)\]\((.*?)\)/g,
              '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
            );
        };

        return (
          <p
            className="mb-6 whitespace-pre-wrap leading-relaxed"
            style={textStyle}
            dangerouslySetInnerHTML={{
              __html: formatInlineText(section.content),
            }}
          />
        );
      case "image":
        return section.imageUrl ? (
          <img
            src={`http://localhost:4000${section.imageUrl}`}
            alt="Blog image"
            className="w-full rounded-lg mb-6"
          />
        ) : null;
      case "two-column":
        const leftColumnStyle = {
          color: section.leftTextColor || "inherit",
          fontSize: section.leftFontSize || "inherit",
        };

        const rightColumnStyle = {
          color: section.rightTextColor || "inherit",
          fontSize: section.rightFontSize || "inherit",
        };

        const formatColumnText = (text: string, isLeft: boolean, isList = false) => {
          const formatted = text
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/__(.*?)__/g, "<u>$1</u>")
            .replace(/~~(.*?)~~/g, "<del>$1</del>")
            .replace(
              /\{\{large:(.*?)\}\}/g,
              '<span style="font-size: 1.25em">$1</span>'
            )
            .replace(
              /\{\{small:(.*?)\}\}/g,
              '<span style="font-size: 0.875em">$1</span>'
            )
            .replace(
              /\[(.*?)\]\((.*?)\)/g,
              '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">$1</a>'
            );

          if (isList) {
            const listStyleType = {
              "list-disc": "disc",
              "list-decimal": "decimal",
              "list-lower-alpha": "lower-alpha",
              "list-upper-alpha": "upper-alpha",
              "list-lower-roman": "lower-roman",
              "list-upper-roman": "upper-roman",
            }[isLeft ? (section.leftListStyle || "list-disc") : (section.rightListStyle || "list-disc")];

            const color = isLeft ? (section.leftTextColor || "inherit") : (section.rightTextColor || "inherit");
            const fontSize = isLeft ? (section.leftFontSize || "inherit") : (section.rightFontSize || "inherit");

            const listItems = text
              .split("\n")
              .filter((line) => line.trim())
              .map(
                (line) =>
                  `<li style="margin-bottom: 0.25rem; color: ${color}">${formatColumnText(line.trim(), isLeft)}</li>`
              )
              .join("");

            return `<ul style="list-style-type: ${listStyleType}; margin-left: 1.5rem; padding-left: 0.5rem; color: ${color}; font-size: ${fontSize}">${listItems}</ul>`;
          }

          return formatted;
        };

        return (
          <div className="grid grid-cols-2 gap-6 mb-4">
            <div>
              {section.leftImageUrl && (
                <img
                  src={`http://localhost:4000${section.leftImageUrl}`}
                  alt="Left column image"
                  className="w-full rounded mb-2"
                />
              )}
              {section.leftIsBulletList ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatColumnText(section.leftContent || "", true, true),
                  }}
                />
              ) : (
                <p
                  className="whitespace-pre-wrap"
                  style={leftColumnStyle}
                  dangerouslySetInnerHTML={{
                    __html: formatColumnText(section.leftContent || "", true),
                  }}
                />
              )}
            </div>
            <div>
              {section.rightImageUrl && (
                <img
                  src={`http://localhost:4000${section.rightImageUrl}`}
                  alt="Right column image"
                  className="w-full rounded mb-2"
                />
              )}
              {section.rightIsBulletList ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: formatColumnText(section.rightContent || "", false, true),
                  }}
                />
              ) : (
                <p
                  className="whitespace-pre-wrap"
                  style={rightColumnStyle}
                  dangerouslySetInnerHTML={{
                    __html: formatColumnText(section.rightContent || "", false),
                  }}
                />
              )}
            </div>
          </div>
        );
      case "code":
        return (
          <CodeBlock
            code={section.content}
            language={section.language}
            showLanguage={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-none">
      {sections.map((section, index) => (
        <div key={section.id || index}>{renderSection(section)}</div>
      ))}
    </div>
  );
}
