export interface RedditComment {
  id: string;
  parent_id: string | null;
  author: string;
  body: string;
  score: number;
  created_utc: number;
  depth: number;
}

export interface RedditPost {
  title: string;
  author: string;
  url: string;
  score: number;
  num_comments: number;
  created_utc: number;
}

export interface RedditApiCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
}

export class RedditApi {
  private accessToken: string | null = null;

  constructor(private credentials: RedditApiCredentials) {}

  async getAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    const auth = btoa(`${this.credentials.clientId}:${this.credentials.clientSecret}`);
    
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Comment Extraction (by u/RedditCommentExtractor)'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials'
      }).toString()
    });

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.statusText}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    if (!this.accessToken) {
      throw new Error('Failed to get access token');
    }
    return this.accessToken;
  }

  async fetchComments(postUrl: string): Promise<{ post: RedditPost; comments: RedditComment[] }> {
    const accessToken = await this.getAccessToken();
    
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

    // Parse post data
    const postData = data[0].data.children[0].data;
    const post: RedditPost = {
      title: postData.title,
      author: postData.author,
      url: postData.url,
      score: postData.score,
      num_comments: postData.num_comments,
      created_utc: postData.created_utc
    };

    // Parse comments
    const commentsData = data[1].data.children;
    const comments = this.parseComments(commentsData, null, 0);

    return { post, comments };
  }

  private parseComments(commentsData: any[], parentId: string | null = null, depth: number = 0): RedditComment[] {
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
          const replies = this.parseComments(item.data.replies.data.children, comment.id, depth + 1);
          comments.push(...replies);
        }
      }
    }

    return comments;
  }
}
