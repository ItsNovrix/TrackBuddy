# Track Buddy - Track users with upcoming flights

Track Buddy is a specialized Reddit bot built specifically for the r/fearofflying subreddit. It monitors posts for users requesting flight tracking support and automatically provides direct links to those flights via FlightAware and FlightRadar24, paired with a supportive message to help reassure anxious flyers.

---

## 🌟 Features

- **Flair-Specific Triggering:** Focuses exclusively on post flair for maximum accuracy.

- **Flight Number Extraction:** Regex support for IATA/ICAO codes (AA123, B6514, JBU514) and letter-number airline IDs (U2).

- **Automated Assistance:** Instantly provides flight tracking links based on extracted flight numbers.

- **Anti-Spam Protection:** Integrated Redis storage ensures the bot only comments once per post.

- **Supportive Messaging:** Includes a curated reassurance message to help anxious flyers feel safer.

- **Bot Configuration:** Target flair, flight number regex, reassurance message, future flight message, and future flight disclaimer are customizable via bot settings.

- **Future Flight Disclaimer:** Scans post content for future-dated keywords (e.g., "tomorrow," "next week") and automatically adds a warning disclaimer about live data availability.

> **Coming Soon:** Manual posting options and future timing adjustments.

---

## 🛠️ How it Works

### Install & Configure

- **Trigger:** The bot activates whenever a new post is created in the subreddit.

- **Filter:** The bot checks if the post has the target post flair and contains tracking-related keywords.

- **Extraction:** The bot uses a custom Regex to find and extract flight numbers (e.g., AA123, DL 456, BA-789).

- **Response:** If all criteria are met, the bot submits a formatted comment with tracking links and a friendly reassurance note (customizable in the bot settings).

- **Future Check:** If the bot detects keywords suggesting the flight isn't happening today, it prepends a "Future Disclaimer" to the comment to account for possible incorrect flight tracking information.

No configuration or set-up is required for the bot to work at this time. All default values to ensure the bot functions properly are already set upon installation. Simply install the bot to your subreddit, and it will start scanning posts!

---

## ⚙️ Configuration (Settings UI)

Track Buddy is designed to be flexible. Moderators can fine-tune the bot's behavior directly through the bot settings. Whether you need to update the trigger flair, adjust the support message, or refine the flight number detection regex, you can manage it all from the Apps section of your Moderation Tools.

- **Required Post Flair**
  - The exact post flair text the bot looks for.

- **Reassurance Message**
  - The supportive text displayed at the bottom of the bot comment.

- **Flight Number Regex**
  - Advanced extraction pattern (supports groups).

- **Future Warning Text**
  - The text shown when a future flight is detected.

- **Future Flight Keywords**
  - Comma-separated list that triggers the warning.

- **Optional comment stickying**
  - Optional toggle to automatically sticky bot comment on submission.

---

## 🧾 Source & License

The source code for Track Buddy is available on [GitHub](https://github.com/ItsNovrix/TrackBuddy).

This project is licensed under the [BSD-3-Clause License](https://opensource.org/licenses/BSD-3-Clause).
This app was developed in compliance with [Reddit's Developer Terms](https://www.redditinc.com/policies/developer-terms) and adheres to the guidelines for the Devvit platform.

---

## 🚀 Changelog

**🛡️ Core Releases**

* v1.0.0: Migrated app off deprecated blocks architecture.
* v1.0.1: Updated app settings.
* v1.0.2: Updated app to latest Devvit version.

**📂 Beta Development History**

* v0.0.1: Basic functionality implemented.
* v0.0.2: Corrected errors in bot logic and comment formatting.
* v0.0.3: Updated README and resource links.
* v0.0.4: Implemented options for customizing keyword tracking, flight number regex, and reassurance message.
* v0.0.5: Implemented disclaimer and keyword tracking for future flights due to future flight tracking limitations.
* v0.0.6: Updated bot logic for tracking post detection.
* v0.0.7: Further updates to bot logic for tracking post detection.
* v0.0.8: Testing updated bot logic for tracking post detection.
* v0.0.9: Official launch version - Updated bot logic implemented and confirmed, bot targets post flair rather than keywords for added reliability.
* v0.0.10: Minor README update and bot reupload due to Devvit error.
* v0.0.11: Added new optional toggle to automatically sticky bot comment on submission.
* v0.0.12: Updated Devvit version to latest version. Updated README.
* v0.0.13: Updated README.
* v0.0.14: Updated app to latest Devvit release.

---

## 🆘 Support

If you encounter any issues or have questions, please DM [u/ItsNovrix](https://reddit.com/u/ItsNovrix).

Thanks for using **Track Buddy**!
