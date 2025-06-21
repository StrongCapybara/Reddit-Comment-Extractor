import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { extractCommentsSchema, redditCredentialsSchema } from "@shared/schema";
import { z } from "zod";

interface RedditComment {
  id: string;
  parent_id: string | null;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  depth: number;
}

interface RedditPost {
  title: string;
  author: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

async function getRedditAccessToken(clientId: string, clientSecret: string, username: string): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  
  const response = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Comment Extraction (by u/RedditCommentExtractor)'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchRedditComments(postUrl: string, accessToken: string): Promise<{ post: RedditPost; comments: RedditComment[] }> {
  // Extract post ID from URL
  const urlMatch = postUrl.match(/\/r\/(\w+)\/comments\/(\w+)/);
  if (!urlMatch) {
    throw new Error('Invalid Reddit post URL format');
  }

  const [, subreddit, postId] = urlMatch;
  const apiUrl = `https://oauth.reddit.com/r/${subreddit}/comments/${postId}.json`;

  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'User-Agent': 'Comment Extraction (by u/RedditCommentExtractor)'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Reddit data: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!Array.isArray(data) || data.length < 2) {
    throw new Error('Unexpected Reddit API response format');
  }

  // Extract post data
  const postData = data[0].data.children[0].data;
  const post: RedditPost = {
    title: postData.title,
    author: postData.author,
    url: postData.url,
    score: postData.score,
    num_comments: postData.num_comments,
    created_utc: postData.created_utc
  };

  // Extract comments
  const commentsData = data[1].data.children;
  const comments = parseRedditComments(commentsData);

  return { post, comments };
}

function parseRedditComments(commentsData: any[], parentId: string | null = null, depth: number = 0): RedditComment[] {
  const comments: RedditComment[] = [];

  for (const item of commentsData) {
    if (item.kind === 't1' && item.data.body && item.data.body !== '[deleted]' && item.data.body !== '[removed]') {
      const comment: RedditComment = {
        id: item.data.id,
        parent_id: parentId,
        author: item.data.author || '[deleted]',
        body: item.data.body,
        score: item.data.score || 0,
        created_utc: item.data.created_utc,
        depth: depth,
      };

      comments.push(comment);

      // Parse replies if they exist
      if (item.data.replies && item.data.replies.data && item.data.replies.data.children) {
        const replies = parseRedditComments(item.data.replies.data.children, item.data.id, depth + 1);
        comments.push(...replies);
      }
    }
  }

  return comments;
}

function formatCommentsAsText(post: RedditPost, comments: RedditComment[]): string {
  let text = `Reddit Post: ${post.title}\n`;
  text += `Author: u/${post.author}\n`;
  text += `Score: ${post.score}\n`;
  text += `Total Comments: ${post.num_comments}\n`;
  text += `Posted: ${new Date(post.created_utc * 1000).toLocaleString()}\n`;
  text += `URL: ${post.url}\n\n`;
  text += "=" .repeat(80) + "\nCOMMENTS\n" + "=".repeat(80) + "\n\n";

  for (const comment of comments) {
    const indent = "    ".repeat(comment.depth); // 4 spaces per depth level like your Python code
    text += `${indent}Author: ${comment.author}\n`;
    text += `${indent}Score: ${comment.score}\n`;
    text += `${indent}Posted: ${new Date(comment.created_utc * 1000).toLocaleString()}\n`;
    text += `${indent}Comment:\n${indent}${comment.body.replace(/\n/g, `\n${indent}`)}\n`;
    text += `${indent}${"-".repeat(40)}\n`;
  }

  return text;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Validate Reddit credentials
  app.post("/api/validate-credentials", async (req, res) => {
    try {
      const { clientId, clientSecret, username } = redditCredentialsSchema.parse(req.body);
      
      // Test the credentials by getting an access token
      await getRedditAccessToken(clientId, clientSecret, username);
      
      res.json({ valid: true });
    } catch (error) {
      console.error("Credential validation error:", error);
      res.status(400).json({ 
        valid: false, 
        error: error instanceof Error ? error.message : "Invalid credentials" 
      });
    }
  });

  // Extract comments from Reddit post
  app.post("/api/extract-comments", async (req, res) => {
    try {
      const { postUrl, clientId, clientSecret, username } = extractCommentsSchema.parse(req.body);
      
      // Create extraction job
      const job = await storage.createExtractionJob({ postUrl });
      await storage.updateExtractionJob(job.id, { status: "processing" });

      // Get access token and fetch comments
      const accessToken = await getRedditAccessToken(clientId, clientSecret, username);
      const { post, comments } = await fetchRedditComments(postUrl, accessToken);
      
      // Format data
      const jsonData = {
        post,
        comments,
        extracted_at: new Date().toISOString(),
        total_comments: comments.length
      };
      
      const textData = formatCommentsAsText(post, comments);
      
      await storage.updateExtractionJob(job.id, {
        status: "completed",
        commentCount: comments.length,
        jsonData,
        textData,
        completedAt: new Date()
      });

      res.json({
        success: true,
        jobId: job.id,
        commentCount: comments.length,
        postTitle: post.title
      });
    } catch (error) {
      console.error("Comment extraction error:", error);
      res.status(400).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to extract comments" 
      });
    }
  });

  // Download JSON file
  app.get("/api/download/:jobId/json", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getExtractionJob(jobId);
      
      if (!job || job.status !== "completed" || !job.jsonData) {
        return res.status(404).json({ error: "Job not found or not completed" });
      }

      const filename = `reddit-comments-${jobId}.json`;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.json(job.jsonData);
    } catch (error) {
      console.error("Download JSON error:", error);
      res.status(500).json({ error: "Failed to download JSON file" });
    }
  });

  // Download text file
  app.get("/api/download/:jobId/text", async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
      const job = await storage.getExtractionJob(jobId);
      
      if (!job || job.status !== "completed" || !job.textData) {
        return res.status(404).json({ error: "Job not found or not completed" });
      }

      const filename = `reddit-comments-${jobId}.txt`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(job.textData);
    } catch (error) {
      console.error("Download text error:", error);
      res.status(500).json({ error: "Failed to download text file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
