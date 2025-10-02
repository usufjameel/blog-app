"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { commentApi } from "@/lib/api/client";
import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/lib/utils";
import { MessageCircle, Reply, Trash2 } from "lucide-react";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  replies: Comment[];
}

interface CommentSectionProps {
  blogId: string;
}

export function CommentSection({ blogId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContents, setReplyContents] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

  const fetchComments = async () => {
    try {
      const response = await commentApi.getComments(blogId);
      setComments(response.data);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      await commentApi.createComment({
        content: newComment,
        blogId,
      });
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    const content = replyContents[parentId];
    if (!user || !content?.trim()) return;

    setSubmitting(true);
    try {
      await commentApi.createComment({
        content,
        blogId,
        parentId,
      });
      setReplyContents((prev) => ({ ...prev, [parentId]: "" }));
      setReplyTo(null);
      fetchComments();
    } catch (error: any) {
      console.error("Error creating reply:", error);
      console.error("Reply error details:", error.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentApi.deleteComment(commentId);
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const CommentItem = useMemo(() => ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {

    return (
      <div className={`${isReply ? "ml-8 border-l-2 border-muted pl-4" : ""}`}>
        <div className="flex items-start space-x-3 mb-4">
          <Avatar className="w-8 h-8">
            <AvatarImage src={comment.author.avatar} />
            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm mb-2 whitespace-pre-wrap">{comment.content}</p>
            <div className="flex items-center space-x-2">
              {user && !isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setReplyTo(replyTo === comment.id ? null : comment.id)
                  }
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}
              {user?.uid === comment.author.id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Delete
                </Button>
              )}
            </div>

            {replyTo === comment.id && (
              <div className="mt-3 space-y-2">
                <Textarea
                  placeholder="Write a reply..."
                  value={replyContents[comment.id] || ""}
                  onChange={(e) =>
                    setReplyContents((prev) => ({
                      ...prev,
                      [comment.id]: e.target.value,
                    }))
                  }
                  className="min-h-[80px]"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    disabled={submitting || !replyContents[comment.id]?.trim()}
                  >
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyContents((prev) => ({
                        ...prev,
                        [comment.id]: "",
                      }));
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {comment.replies &&
          comment.replies.map((reply) => (
            <div key={reply.id}>{renderCommentItem(reply, true)}</div>
          ))}
      </div>
    );
  }, [user, replyTo, replyContents, submitting]);

  const renderCommentItem = useCallback((comment: Comment, isReply = false) => {
    return CommentItem({ comment, isReply });
  }, [CommentItem]);

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Comments ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {user && (
          <div className="space-y-3">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleSubmitComment}
              disabled={submitting || !newComment.trim()}
            >
              Post Comment
            </Button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id}>{renderCommentItem(comment)}</div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
