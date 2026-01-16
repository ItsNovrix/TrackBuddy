import { Devvit, SettingScope } from '@devvit/public-api';
import { FUTURE_KEYWORDS } from './config.js'; 

Devvit.configure({
  redditAPI: true,
  redis: true,
});

Devvit.addSettings([
  {
    type: 'string',
    name: 'required_flair',
    label: 'Required Post Flair',
    helpText: 'The bot only triggers on posts with this exact flair.',
    defaultValue: 'Tracking Request',
    scope: SettingScope.Installation,
  },
  {
    type: 'paragraph',
    name: 'reassurance_message',
    label: 'Reassurance Message',
    helpText: 'The support message at the bottom of the comment.',
    defaultValue: 'Delays, altitude changes, and routing adjustments are completely normal. You are safe, and you are not alone.',
    scope: SettingScope.Installation,
  },
  {
    type: 'string',
    name: 'flight_regex_setting',
    label: 'Flight Number Regex (Advanced)',
    helpText: 'Regex for extraction. Ensure it has capturing groups.',
    defaultValue: '([A-Z\\d]{2,3})[\\s-]?(\\d{1,5})', 
    scope: SettingScope.Installation,
  },
  {
    type: 'paragraph',
    name: 'future_warning_text',
    label: 'Future Flight Disclaimer',
    helpText: 'Warning shown if future keywords are detected.',
    defaultValue: "Note: Since your flight appears to be in the future, these links may show today's flights until your actual departure time.",
    scope: SettingScope.Installation,
  },
  {
    type: 'paragraph',
    name: 'future_keywords',
    label: 'Future Flight Keywords',
    helpText: 'Keywords that trigger the future disclaimer.',
    defaultValue: FUTURE_KEYWORDS.join(', '), 
    scope: SettingScope.Installation,
  },
]);

// Helper: Keyword matching
function containsKeyword(text: string, keywordsString: string): boolean {
  const lowerText = text.toLowerCase();
  const keywords = keywordsString.split(',').map(kw => kw.trim().toLowerCase());
  return keywords.some(kw => kw !== "" && lowerText.includes(kw));
}

// Helper: Extraction
function extractFlightNumber(text: string, regexString: string): string | null {
  const regex = new RegExp(regexString, 'i');
  const match = text.match(regex);
  
  if (match && match[1] && match[2]) {
    // Group 1 is the Airline, Group 2 is the Number
    return (match[1] + match[2]).toUpperCase().replace(/\s+/g, '');
  }
  
  return null;
}

Devvit.addTrigger({
  event: 'PostCreate',
  onEvent: async (event, context) => {
    try {
      if (!event.post) return;
      const postId = event.post.id;

      // 1. Fetch Settings & Post Data
      const [post, settings] = await Promise.all([
        context.reddit.getPostById(postId),
        context.settings.getAll()
      ]);

      const flair = post.flair?.text ?? "";
      const title = post.title ?? "";
      const body = post.body ?? "";
      const fullText = `${title} ${body}`.toLowerCase();

      console.log(`[Processing] Post ID: ${postId}`);
      console.log(`[Check] Flair detected: "${flair}" | Target: "${settings.required_flair}"`);

      // 2. PRIMARY TRIGGER: Flair Check
      if (flair !== settings.required_flair) {
        console.log("[Skip] Flair mismatch.");
        return;
      }

      // 3. EXTRACTION: Find flight number
      const flightNumber = extractFlightNumber(fullText, settings.flight_regex_setting as string);
      console.log(`[Check] Flight Number: ${flightNumber}`);
      
      if (!flightNumber) {
        console.log("[Skip] No valid flight number detected.");
        return;
      }

      // 4. STORAGE CHECK: Prevent double comments
      const storageKey = `commented_${postId}`;
      const alreadyCommented = await context.redis.get(storageKey);
      if (alreadyCommented) {
        console.log("[Skip] Already commented on this post.");
        return;
      }

      // 5. FUTURE CHECK: Purely for the optional warning text
      let futureDisclaimer = "";
      const futureKeywords = (settings.future_keywords as string) || FUTURE_KEYWORDS.join(', ');
      if (containsKeyword(fullText, futureKeywords)) {
          console.log("[Info] Future keywords detected. Adding warning disclaimer.");
          futureDisclaimer = `⚠️ ***${settings.future_warning_text}***\n\n`;
      }

      // 6. BUILD COMMENT
      const commentText = 
        futureDisclaimer +
        `✈️ OP has requested tracking. If you'd like to follow along and send reassurance, you can track the flight here:\n\n` +
        `🔗 [FlightAware](https://flightaware.com/live/flight/${flightNumber}) | ` +
        `🔗 [FlightRadar24](https://www.flightradar24.com/${flightNumber})\n\n` +
        `💙 *Reminder: ${settings.reassurance_message}*\n\n` +
        `*I am a bot, and this action was performed automatically. Please [contact the moderators of this subreddit](https://www.reddit.com/message/compose/?to=/r/fearofflying) if you have any questions or concerns.*\n\n` +
        `*This bot does not access live flight data.*`;

      // 7. EXECUTE
      await context.reddit.submitComment({ id: postId, text: commentText });
      await context.redis.set(storageKey, 'true');
      await context.redis.expire(storageKey, 604800);
      console.log("[Success] Comment posted successfully.");

    } catch (error) {
      console.error("[Error] Critical failure in PostCreate trigger:", error);
    }
  },
});

export default Devvit;