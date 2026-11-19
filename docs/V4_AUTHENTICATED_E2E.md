# Authenticated E2E release gate

The public screenshot jobs are **not** sufficient to certify production backend functionality.

The manually triggered GitHub Actions workflow \`Wanderly V4 Authenticated Integration\` uses the \`wanderly-e2e\` GitHub environment and requires protected secrets:

- \`WANDERLY_TEST_URL\`: URL of an isolated accessible Vercel Preview (not a public production account).
- \`WANDERLY_TEST_EMAIL\` and \`WANDERLY_TEST_PASSWORD\`: confirmed, disposable primary Supabase test account.
- \`WANDERLY_SECOND_TEST_EMAIL\` and \`WANDERLY_SECOND_TEST_PASSWORD\`: a separate confirmed QA account for isolation tests (recommended).
- \`VERCEL_AUTOMATION_BYPASS_SECRET\`: optional, for a protected Preview.
- \`WANDERLY_AI_LIVE_TEST=1\`: optional GitHub environment **variable**, to spend one real GroqCloud Free API request. Default off until `GROQ_API_KEY` is configured and the provider account is confirmed to be on Free.

Never put login credentials in the repository, issues, chats, logs or screenshots. Restrict the environment to reviewed commits, and require a reviewer. The test creates a unique QA trip, checks custom destination, expenses, private journal image upload, Supabase favorites, optional second-user RLS, optional live AI inference, and deletes the test trip in \`finally\`.

Release only after this workflow passes using real accounts AND a reviewed screenshot comparison. If a test fails, inspect its logs and the QA trip titled \`Wanderly QA …\` left behind if cleanup could not complete.

Current V4 uses only GroqCloud Free; real model inference must still be confirmed with a valid Free API key. Screenshot and build checks do not prove AI responses work.
