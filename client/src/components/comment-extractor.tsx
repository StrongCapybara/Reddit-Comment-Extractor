import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";
import { extractCommentsSchema, type RedditCredentials } from "@shared/schema";
import { z } from "zod";

interface CommentExtractorProps {
  credentials: RedditCredentials;
}

const urlSchema = z.object({
  postUrl: z.string().url("Must be a valid URL").refine(
    (url) => url.includes("reddit.com/r/") && url.includes("/comments/"),
    "Must be a valid Reddit post URL"
  ),
});

interface ExtractionResult {
  jobId: number;
  commentCount: number;
  postTitle: string;
}

interface CommentViewData {
  post: {
    title: string;
    author: string;
    score: number;
    num_comments: number;
    created_utc: number;
    url: string;
  };
  comments: Array<{
    id: string;
    parent_id: string | null;
    author: string;
    body: string;
    score: number;
    created_utc: number;
    depth: number;
  }>;
}

export function CommentExtractor({ credentials }: CommentExtractorProps) {
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [commentData, setCommentData] = useState<CommentViewData | null>(null);
  const [showComments, setShowComments] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ postUrl: string }>({
    resolver: zodResolver(urlSchema),
  });

  const extractMutation = useMutation({
    mutationFn: async (data: { postUrl: string }) => {
      setProgress(25);
      const response = await apiRequest("POST", "/api/extract-comments", {
        ...data,
        ...credentials,
      });
      setProgress(75);
      const result = await response.json();
      setProgress(100);
      return result;
    },
    onSuccess: (data) => {
      setExtractionResult(data);
    },
    onError: () => {
      setProgress(0);
    },
  });

  const validateUrl = (url: string) => {
    try {
      urlSchema.parse({ postUrl: url });
      return { valid: true, message: "URL format is valid!" };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return { valid: false, message: error.errors[0].message };
      }
      return { valid: false, message: "Invalid URL format" };
    }
  };

  const handleFormSubmit = (data: { postUrl: string }) => {
    setProgress(0);
    setExtractionResult(null);
    extractMutation.mutate(data);
  };

  const downloadFile = async (jobId: number, format: "json" | "text") => {
    try {
      const response = await fetch(`/api/download/${jobId}/${format}`);
      if (!response.ok) throw new Error("Download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      
      // Use post title for filename, sanitized for file system
      const sanitizedTitle = extractionResult?.postTitle
        ?.replace(/[^a-z0-9]/gi, '_')
        ?.toLowerCase() || `reddit-comments-${jobId}`;
      
      a.download = `${sanitizedTitle}.${format === "json" ? "json" : "txt"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const viewComments = async (jobId: number) => {
    try {
      const response = await fetch(`/api/download/${jobId}/json`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      const data = await response.json();
      setCommentData(data);
      setShowComments(true);
    } catch (error) {
      console.error("View comments error:", error);
    }
  };

  return (
    <section className="mb-12">
      <div className="bg-surface rounded-2xl p-8 border border-surface-variant">
        <div className="flex items-start space-x-4 mb-6">
          <div className="bg-emerald-500/10 p-3 rounded-xl">
            <i className="fas fa-download text-emerald-500 text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-50 mb-2">Step 3: Extract Comments</h2>
            <p className="text-slate-300">Enter the Reddit post URL to extract and download comments</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="postUrl" className="text-slate-300">Reddit Post URL</Label>
            <div className="relative">
              <Input
                id="postUrl"
                {...register("postUrl")}
                placeholder="https://www.reddit.com/r/subreddit/comments/..."
                className="bg-slate-800 border-slate-600 text-slate-50 placeholder-slate-400 pr-10"
              />
              <i className="fas fa-link absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"></i>
            </div>
            <p className="text-xs text-slate-400">Paste the full URL of the Reddit post you want to extract comments from</p>
            {errors.postUrl && (
              <p className="text-sm text-red-400">{errors.postUrl.message}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              type="submit" 
              disabled={extractMutation.isPending}
              className="flex-1 bg-primary hover:bg-blue-600"
            >
              <i className="fas fa-play mr-2"></i>
              <span>Extract Comments</span>
            </Button>
            
            <Button 
              type="button" 
              variant="secondary"
              className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-300"
              onClick={() => {
                const url = (document.getElementById("postUrl") as HTMLInputElement)?.value;
                if (url) {
                  const result = validateUrl(url);
                  // TODO: Show validation result in UI
                  alert(result.message);
                }
              }}
            >
              <i className="fas fa-check-circle mr-2"></i>
              <span>Validate URL</span>
            </Button>
          </div>
        </form>

        {/* Loading State */}
        {extractMutation.isPending && (
          <div className="mt-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center space-x-4 mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium text-slate-50">Extracting Comments...</p>
                <p className="text-sm text-slate-400">This may take a few moments depending on the number of comments</p>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        )}

        {/* Success State */}
        {extractionResult && (
          <div className="mt-8 bg-emerald-900/20 border border-emerald-700/50 rounded-xl p-6">
            <div className="flex items-start space-x-4 mb-4">
              <i className="fas fa-check-circle text-emerald-400 text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-emerald-400 mb-1">Comments Extracted Successfully!</h3>
                <p className="text-sm text-emerald-300">
                  Found {extractionResult.commentCount} comments from "{extractionResult.postTitle}"
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Button 
                onClick={() => viewComments(extractionResult.jobId)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <i className="fas fa-eye mr-2"></i>
                <span>View Comments</span>
              </Button>
              <Button 
                onClick={() => downloadFile(extractionResult.jobId, "json")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <i className="fas fa-download mr-2"></i>
                <span>Download JSON</span>
              </Button>
              <Button 
                onClick={() => downloadFile(extractionResult.jobId, "text")}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <i className="fas fa-file-alt mr-2"></i>
                <span>Download Text</span>
              </Button>
            </div>

            <div className="mt-4 text-xs text-emerald-400">
              <p><strong>JSON file:</strong> Machine-readable format with full comment data and metadata</p>
              <p><strong>Text file:</strong> Human-readable format with formatted comments and replies</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {extractMutation.error && (
          <div className="mt-8 bg-red-900/20 border border-red-700/50 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <i className="fas fa-exclamation-triangle text-red-400 text-xl mt-0.5"></i>
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Error Extracting Comments</h3>
                <p className="text-sm text-red-300 mb-3">
                  {extractMutation.error instanceof Error ? extractMutation.error.message : "Failed to extract comments"}
                </p>
                <Button 
                  onClick={() => extractMutation.reset()}
                  variant="destructive"
                  size="sm"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Comment Viewer Modal */}
        {showComments && commentData && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-surface rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-surface-variant">
              <div className="flex items-center justify-between p-6 border-b border-surface-variant">
                <div>
                  <h3 className="text-xl font-bold text-slate-50">{commentData.post.title}</h3>
                  <p className="text-sm text-slate-400">
                    by u/{commentData.post.author} • {commentData.comments.length} comments • Score: {commentData.post.score}
                  </p>
                </div>
                <Button 
                  onClick={() => setShowComments(false)}
                  variant="ghost"
                  size="sm"
                  className="text-slate-400 hover:text-slate-300"
                >
                  <i className="fas fa-times text-lg"></i>
                </Button>
              </div>
              
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-2 sm:p-6">
                <div className="space-y-4">
                  {commentData.comments.map((comment) => {
                    // Limit max indent to 80px, use horizontal scroll for more
                    const maxIndent = 80; // px
                    const indent = Math.min(comment.depth * 16, maxIndent);
                    return (
                      <div 
                        key={comment.id} 
                        className="border-l-2 border-slate-600 pl-3 sm:pl-4"
                        style={{ marginLeft: indent, overflowX: comment.depth * 16 > maxIndent ? 'auto' : 'visible' }}
                      >
                        <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-700 overflow-x-auto">
                          <div className="flex flex-wrap items-center space-x-2 mb-2">
                            <span className="font-medium text-slate-300">u/{comment.author}</span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">
                              {new Date(comment.created_utc * 1000).toLocaleString()}
                            </span>
                            <span className="text-xs text-slate-500">•</span>
                            <span className="text-xs text-slate-500">Score: {comment.score}</span>
                            {comment.depth > 0 && (
                              <>
                                <span className="text-xs text-slate-500">•</span>
                                <span className="text-xs text-slate-500">Depth: {comment.depth}</span>
                              </>
                            )}
                          </div>
                          <div className="text-slate-300 text-sm whitespace-pre-wrap leading-relaxed break-words overflow-wrap break-word" style={{ wordBreak: 'break-word' }}>
                            {comment.body}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {commentData.comments.length === 0 && (
                  <div className="text-center py-12 text-slate-400">
                    <i className="fas fa-comment-slash text-4xl mb-4"></i>
                    <p>No comments found for this post.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
