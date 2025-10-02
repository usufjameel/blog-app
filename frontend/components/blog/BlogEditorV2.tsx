"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadApi, blogApi } from "@/lib/api/client";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import {
  Upload,
  Eye,
  Plus,
  Trash2,
  Type,
  Image as ImageIcon,
  Columns,
  Columns2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Code,
  Edit3,
} from "lucide-react";
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

interface BlogEditorV2Props {
  editMode?: boolean;
  existingBlog?: any;
}

export function BlogEditorV2({ editMode = false, existingBlog }: BlogEditorV2Props) {
  const [title, setTitle] = useState(existingBlog?.title || "");
  const [excerpt, setExcerpt] = useState(existingBlog?.excerpt || "");
  const [coverImage, setCoverImage] = useState(existingBlog?.coverImage || "");
  const [sections, setSections] = useState<Section[]>(
    existingBlog?.content ? JSON.parse(existingBlog.content) : []
  );
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const addSection = (
    type: Section["type"],
    layout: Section["layout"] = "single"
  ) => {
    const newSection: Section = {
      id: Date.now().toString(),
      type,
      layout,
      content: "",
    };
    setSections([...sections, newSection]);
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const moveSectionUp = (id: string) => {
    const index = sections.findIndex((section) => section.id === id);
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index], newSections[index - 1]] = [
        newSections[index - 1],
        newSections[index],
      ];
      setSections(newSections);
    }
  };

  const moveSectionDown = (id: string) => {
    const index = sections.findIndex((section) => section.id === id);
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [
        newSections[index + 1],
        newSections[index],
      ];
      setSections(newSections);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newSections = [...sections];
    const draggedSection = newSections[draggedIndex];
    newSections.splice(draggedIndex, 1);
    newSections.splice(dropIndex, 0, draggedSection);

    setSections(newSections);
    setDraggedIndex(null);
  };

  const handleImageUpload = async (
    file: File,
    sectionId?: string,
    field?: string
  ) => {
    setLoading(true);
    try {
      const response = await uploadApi.uploadImage(file);
      if (sectionId && field) {
        updateSection(sectionId, { [field]: response.data.url });
      } else if (sectionId) {
        updateSection(sectionId, { imageUrl: response.data.url });
      } else {
        setCoverImage(response.data.url);
      }
      toast({ title: "Image uploaded successfully" });
      return response.data.url;
    } catch (error: any) {
      toast({ title: "Error uploading image", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const generateContent = () => {
    return JSON.stringify(sections);
  };

  const renderPreviewSection = (section: Section) => {
    switch (section.type) {
      case "header":
        return <h1 className="text-3xl font-bold mb-4">{section.content}</h1>;
      case "subheader":
        return (
          <h2 className="text-2xl font-semibold mb-3">{section.content}</h2>
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
            <ul className="mb-4" style={listStyle}>
              {section.content
                .split("\n")
                .filter((line) => line.trim())
                .map((line, i) => (
                  <li
                    key={i}
                    className="mb-1"
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
            className="mb-4 whitespace-pre-wrap"
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
            className="w-full rounded mb-4"
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

        const formatColumnText = (
          text: string,
          isLeft: boolean,
          isList = false
        ) => {
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
            }[
              isLeft
                ? section.leftListStyle || "list-disc"
                : section.rightListStyle || "list-disc"
            ];

            const color = isLeft
              ? section.leftTextColor || "inherit"
              : section.rightTextColor || "inherit";
            const fontSize = isLeft
              ? section.leftFontSize || "inherit"
              : section.rightFontSize || "inherit";

            const listItems: string = text
              .split("\n")
              .filter((line) => line.trim())
              .map(
                (line) =>
                  `<li style="margin-bottom: 0.25rem; color: ${color}">${formatColumnText(
                    line.trim(),
                    isLeft
                  )}</li>`
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
                    __html: formatColumnText(
                      section.leftContent || "",
                      true,
                      true
                    ),
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
                    __html: formatColumnText(
                      section.rightContent || "",
                      false,
                      true
                    ),
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

  const handleSave = async (publishNow = false) => {
    if (!title.trim() || sections.length === 0) {
      toast({
        title: "Title and content are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const content = generateContent();
      const blogData = {
        title,
        content,
        excerpt: excerpt.trim() || '',
        coverImage,
        published: publishNow,
      };

      if (editMode && existingBlog) {
        await blogApi.updateBlog(existingBlog.id, blogData);
        toast({ title: "Blog updated successfully" });
      } else {
        await blogApi.createBlog(blogData);
        toast({ title: "Blog created successfully" });
      }
      router.push("/");
    } catch (error) {
      toast({ title: editMode ? "Error updating blog" : "Error saving blog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Are you sure you want to unpublish this blog?")) return;

    setLoading(true);
    try {
      await blogApi.updateBlog(existingBlog.id, { published: false });
      toast({ title: "Blog unpublished successfully" });
      router.push("/dashboard");
    } catch (error) {
      toast({ title: "Error unpublishing blog", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: Section, index: number) => {
    const isDouble = section.layout === "double";

    return (
      <Card
        key={section.id}
        className="mb-4 cursor-move"
        draggable
        onDragStart={(e) => handleDragStart(e, index)}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, index)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="w-4 h-4 text-muted-foreground" />
              {section.type === "text" && <Type className="w-4 h-4" />}
              {section.type === "image" && <ImageIcon className="w-4 h-4" />}
              {section.type === "header" && (
                <span className="font-bold">H1</span>
              )}
              {section.type === "subheader" && (
                <span className="font-semibold">H2</span>
              )}
              {section.type === "two-column" && (
                <Columns2 className="w-4 h-4" />
              )}
              {section.type === "code" && <Code className="w-4 h-4" />}
              <span className="text-sm capitalize">{section.type}</span>
              {isDouble && <Columns2 className="w-4 h-4" />}
            </div>
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveSectionUp(section.id)}
                disabled={sections.findIndex((s) => s.id === section.id) === 0}
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveSectionDown(section.id)}
                disabled={
                  sections.findIndex((s) => s.id === section.id) ===
                  sections.length - 1
                }
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSection(section.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {section.type === "image" ? (
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file, section.id);
                }}
              />
              {section.imageUrl && (
                <img
                  src={`http://localhost:4000${section.imageUrl}`}
                  alt="Section image"
                  className="w-full h-32 object-cover rounded"
                />
              )}
            </div>
          ) : section.type === "two-column" ? (
            <div className="space-y-4">
              <div className="text-xs text-gray-600 mb-2">
                Use: **bold** *italic* __underline__ ~~strikethrough~~{" "}
                {`{{ large: text }} {{ small: text }}`} [link text](url)
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Left Column</label>
                  <div className="flex gap-1 mb-2">
                    <Input
                      type="color"
                      value={section.leftTextColor || "#000000"}
                      onChange={(e) =>
                        updateSection(section.id, {
                          leftTextColor: e.target.value,
                        })
                      }
                      className="w-12 h-6"
                      title="Left Text Color"
                    />
                    <select
                      value={section.leftFontSize || "16px"}
                      onChange={(e) =>
                        updateSection(section.id, {
                          leftFontSize: e.target.value,
                        })
                      }
                      className="px-1 py-1 border rounded text-xs"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={section.leftIsBulletList || false}
                        onChange={(e) =>
                          updateSection(section.id, {
                            leftIsBulletList: e.target.checked,
                          })
                        }
                      />
                      List
                    </label>
                  </div>
                  {section.leftIsBulletList && (
                    <select
                      value={section.leftListStyle || "list-disc"}
                      onChange={(e) =>
                        updateSection(section.id, {
                          leftListStyle: e.target.value,
                        })
                      }
                      className="px-2 py-1 border rounded text-xs mb-2"
                    >
                      <option value="list-disc">• Bullets</option>
                      <option value="list-decimal">1. Numbers</option>
                      <option value="list-lower-alpha">a. Lowercase</option>
                      <option value="list-upper-alpha">A. Uppercase</option>
                      <option value="list-lower-roman">i. Roman Lower</option>
                      <option value="list-upper-roman">I. Roman Upper</option>
                    </select>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        handleImageUpload(file, section.id, "leftImageUrl");
                    }}
                  />
                  {section.leftImageUrl && (
                    <img
                      src={`http://localhost:4000${section.leftImageUrl}`}
                      alt="Left image"
                      className="w-full h-20 object-cover rounded"
                    />
                  )}
                  <Textarea
                    placeholder="Left column content..."
                    value={section.leftContent || ""}
                    onChange={(e) =>
                      updateSection(section.id, { leftContent: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Right Column</label>
                  <div className="flex gap-1 mb-2">
                    <Input
                      type="color"
                      value={section.rightTextColor || "#000000"}
                      onChange={(e) =>
                        updateSection(section.id, {
                          rightTextColor: e.target.value,
                        })
                      }
                      className="w-12 h-6"
                      title="Right Text Color"
                    />
                    <select
                      value={section.rightFontSize || "16px"}
                      onChange={(e) =>
                        updateSection(section.id, {
                          rightFontSize: e.target.value,
                        })
                      }
                      className="px-1 py-1 border rounded text-xs"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs">
                      <input
                        type="checkbox"
                        checked={section.rightIsBulletList || false}
                        onChange={(e) =>
                          updateSection(section.id, {
                            rightIsBulletList: e.target.checked,
                          })
                        }
                      />
                      List
                    </label>
                  </div>
                  {section.rightIsBulletList && (
                    <select
                      value={section.rightListStyle || "list-disc"}
                      onChange={(e) =>
                        updateSection(section.id, {
                          rightListStyle: e.target.value,
                        })
                      }
                      className="px-2 py-1 border rounded text-xs mb-2"
                    >
                      <option value="list-disc">• Bullets</option>
                      <option value="list-decimal">1. Numbers</option>
                      <option value="list-lower-alpha">a. Lowercase</option>
                      <option value="list-upper-alpha">A. Uppercase</option>
                      <option value="list-lower-roman">i. Roman Lower</option>
                      <option value="list-upper-roman">I. Roman Upper</option>
                    </select>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file)
                        handleImageUpload(file, section.id, "rightImageUrl");
                    }}
                  />
                  {section.rightImageUrl && (
                    <img
                      src={`http://localhost:4000${section.rightImageUrl}`}
                      alt="Right image"
                      className="w-full h-20 object-cover rounded"
                    />
                  )}
                  <Textarea
                    placeholder="Right column content..."
                    value={section.rightContent || ""}
                    onChange={(e) =>
                      updateSection(section.id, {
                        rightContent: e.target.value,
                      })
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          ) : section.type === "code" ? (
            <div className="space-y-2">
              <Input
                placeholder="Language (e.g., javascript, python, html)"
                value={section.language || ""}
                onChange={(e) =>
                  updateSection(section.id, { language: e.target.value })
                }
              />
              <Textarea
                placeholder="Enter your code here..."
                value={section.content}
                onChange={(e) =>
                  updateSection(section.id, { content: e.target.value })
                }
                className="font-mono min-h-[200px]"
              />
            </div>
          ) : (
            <div className="space-y-2">
              {section.type === "text" && (
                <>
                  <div className="text-xs text-gray-600 mb-2">
                    Use: **bold** *italic* __underline__ ~~strikethrough~~{" "}
                    {`{{large:text}} {{small:text}}`} [link text](url)
                  </div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      type="color"
                      value={section.textColor || "#000000"}
                      onChange={(e) =>
                        updateSection(section.id, { textColor: e.target.value })
                      }
                      className="w-16 h-8"
                      title="Text Color"
                    />
                    <select
                      value={section.fontSize || "16px"}
                      onChange={(e) =>
                        updateSection(section.id, { fontSize: e.target.value })
                      }
                      className="px-2 py-1 border rounded text-sm"
                    >
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                      <option value="16px">16px</option>
                      <option value="18px">18px</option>
                      <option value="20px">20px</option>
                      <option value="24px">24px</option>
                    </select>
                    <label className="flex items-center gap-1 text-sm">
                      <input
                        type="checkbox"
                        checked={section.isBulletList || false}
                        onChange={(e) =>
                          updateSection(section.id, {
                            isBulletList: e.target.checked,
                          })
                        }
                      />
                      List
                    </label>
                    {section.isBulletList && (
                      <select
                        value={section.listStyle || "list-disc"}
                        onChange={(e) =>
                          updateSection(section.id, {
                            listStyle: e.target.value,
                          })
                        }
                        className="px-2 py-1 border rounded text-sm"
                      >
                        <option value="list-disc">• Bullets</option>
                        <option value="list-decimal">1. Numbers</option>
                        <option value="list-lower-alpha">a. Lowercase</option>
                        <option value="list-upper-alpha">A. Uppercase</option>
                        <option value="list-lower-roman">i. Roman Lower</option>
                        <option value="list-upper-roman">I. Roman Upper</option>
                      </select>
                    )}
                  </div>
                </>
              )}
              <Textarea
                placeholder={`Enter ${section.type} content...`}
                value={section.content}
                onChange={(e) =>
                  updateSection(section.id, { content: e.target.value })
                }
                className={
                  section.type === "header"
                    ? "text-xl font-bold"
                    : section.type === "subheader"
                    ? "text-lg font-semibold"
                    : ""
                }
              />
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">{editMode ? "Edit Blog" : "Create New Blog"}</h1>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setPreview(!preview)}>
              {preview ? (
                <>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
            {editMode && existingBlog?.published ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={loading}
                >
                  Update
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleUnpublish}
                  disabled={loading}
                >
                  Unpublish
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={loading}
                >
                  {editMode ? "Update" : "Save Draft"}
                </Button>
                <Button onClick={() => handleSave(true)} disabled={loading}>
                  Publish
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Blog title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-semibold"
          />

          <Input
            placeholder="Brief excerpt (optional)..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Cover Image
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            {coverImage && (
              <img
                src={`http://localhost:4000${coverImage}`}
                alt="Cover preview"
                className="w-32 h-32 object-cover rounded mt-2"
              />
            )}
          </div>

          {!preview ? (
            <>
              <div className="flex flex-wrap gap-2 p-4 bg-muted rounded">
                <Button size="sm" onClick={() => addSection("header")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Header
                </Button>
                <Button size="sm" onClick={() => addSection("subheader")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Subheader
                </Button>
                <Button size="sm" onClick={() => addSection("text")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Text
                </Button>
                <Button size="sm" onClick={() => addSection("image")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Image
                </Button>
                <Button size="sm" onClick={() => addSection("two-column")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Two Columns
                </Button>
                <Button size="sm" onClick={() => addSection("code")}>
                  <Plus className="w-4 h-4 mr-1" />
                  Code
                </Button>
              </div>

              {sections.map((section, index) => renderSection(section, index))}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <h1 className="text-4xl font-bold mb-6">
                    {title || "Blog Title"}
                  </h1>
                  {coverImage && (
                    <img
                      src={`http://localhost:4000${coverImage}`}
                      alt="Cover image"
                      className="w-full rounded mb-6"
                    />
                  )}
                  {sections.map((section, index) => (
                    <div key={section.id}>{renderPreviewSection(section)}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
