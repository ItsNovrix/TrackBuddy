import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { createServer, getServerPort, reddit, redis, settings } from '@devvit/web/server';
import type { OnPostSubmitRequest, TriggerResponse } from '@devvit/web/shared';
import { FLIGHT_REGEX, FUTURE_KEYWORDS } from './config.js';

const app = new Hono();

// Helper functions
function containsKeyword(text: string, keywordsString: string): boolean {
  const lowerText = text.toLowerCase();
  const keywords = keywordsString.split(',').map(kw => kw.trim().toLowerCase());
  return keywords.some(kw => kw !== "" && lowerText.includes(kw));
}

function extractFlightNumber(text: string): string | null {
  const match = text.match(FLIGHT_REGEX);
  
  if (match && match[1] && match[2]) {
    return (match[1] + match[2]).toUpperCase().replace(/\s+/g, '');
  }
  
  return null;
}

// Core web endpoint trigger
app.post('/internal/triggers/on-post-submit', async (c) => {
  try {
    const input = await c.req.json<OnPostSubmitRequest>();
    const post = input.post;
    
    if (!post || !post.id) {
      return c.json<TriggerResponse>({ status: 'ignored' });
    }

    const postId = post.id as `t3_${string}`;

    // Fetch the full post from Reddit API to get the active flair
    const fullPost = await reddit.getPostById(postId);
    const flair = fullPost.flair?.text ?? "";
    const title = fullPost.title ?? "";
    const body = fullPost.body ?? "";
    const fullText = `${title} ${body}`.toLowerCase();

    // Fetch settings from devvit.json
    const required_flair = await settings.get<string>('required_flair') ?? 'Tracking Request';
    const reassurance_message = await settings.get<string>('reassurance_message') ?? '';
    const future_warning_text = await settings.get<string>('future_warning_text') ?? '';
    const future_keywords_setting = await settings.get<string>('future_keywords') ?? '';
    const sticky_comment = await settings.get<boolean>('sticky_comment') ?? false;

    console.log(`[Processing] Post ID: ${postId}`);
    console.log(`[Check] Flair detected: "${flair}" | Target: "${required_flair}"`);

    // Flair check trigger
    if (flair !== required_flair) {
      console.log("[Skip] Flair mismatch.");
      return c.json<TriggerResponse>({ status: 'ok' });
    }

    // Flight number extraction
    const flightNumber = extractFlightNumber(fullText);
    console.log(`[Check] Flight Number: ${flightNumber}`);
    
    if (!flightNumber) {
      console.log("[Skip] No valid flight number detected.");
      return c.json<TriggerResponse>({ status: 'ok' });
    }

    // Prevent duplicate comments
    const storageKey = `commented_${postId}`;
    const alreadyCommented = await redis.get(storageKey);
    if (alreadyCommented) {
      console.log("[Skip] Already commented on this post.");
      return c.json<TriggerResponse>({ status: 'ok' });
    }

    // Warning text overlay
    let futureDisclaimer = "";
    let keywordsToUse = future_keywords_setting;
    if (!keywordsToUse && typeof FUTURE_KEYWORDS !== 'undefined') {
        keywordsToUse = FUTURE_KEYWORDS.join(', ');
    }
    
    if (containsKeyword(fullText, keywordsToUse)) {
        console.log("[Info] Future keywords detected. Adding warning disclaimer.");
        futureDisclaimer = `⚠️ ***${future_warning_text}***\n\n`;
    }

    // Tracking comment
    const commentText = 
      futureDisclaimer +
      `✈️ OP has requested tracking. If you'd like to follow along and send reassurance, you can track the flight here:\n\n` +
      `🔗 [FlightAware](https://flightaware.com/live/flight/${flightNumber}) | ` +
      `🔗 [FlightRadar24](https://www.flightradar24.com/${flightNumber})\n\n` +
      `💙 *Reminder: ${reassurance_message}*\n\n` +
      `*I am a bot, and this action was performed automatically. Please [contact the moderators of this subreddit](https://www.reddit.com/message/compose/?to=/r/fearofflying) if you have any questions or concerns.*\n\n` +
      `*This bot does not access live flight data.*`;

    const comment = await reddit.submitComment({ id: postId, text: commentText });
    console.log("[Success] Comment posted successfully.");

    if (sticky_comment) {
      try {
        await comment.distinguish(true);
        console.log("[Success] Comment stickied.");
      } catch (stickyError) {
        console.error("[Error] Failed to sticky comment:", stickyError);
      }
    }

    await redis.set(storageKey, 'true');
    await redis.expire(storageKey, 604800); // Expires after 7 days

    return c.json<TriggerResponse>({ status: 'ok' });

  } catch (error) {
    console.error("[Error] Critical failure in on-post-submit trigger:", error);
    return c.json<TriggerResponse>({ status: 'error' });
  }
});

// Start the server
serve({
  fetch: app.fetch,
  createServer,
  port: getServerPort(),
});