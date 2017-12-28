# TagFics
Automatically generate tag lists from Google Spreadsheets to use on Tumblr.

## How it works
1. Extracts the spreasheet ID from the URL.
2. Using the ID and the range (sheet name) it sends a request to the Google Sheets API to get the data in that sheet.
3. Translates the column name to a number (`A` -> 0, `B` -> 1, etc) to extract the column data.
4. Cleans up the usernames (some people could write it with an `@` at the beginning, other could link their blog `example.tumblr.com` or leave trailing/preceding spaces).
5. Puts tumblr's tag HTML tags that the app/site recognizes and converts to notifiable mentions (`<a class="tumblelog" spellcheck="false">@USERNAME</a>`).

All of this is done on the client, no server-side code/processing.

## Contribute
Found a bug, something broke, or want to add a new feature? Pull Requests are welcome. No need for prior permission or anything. This is a great first contribution for beginners, as well.
