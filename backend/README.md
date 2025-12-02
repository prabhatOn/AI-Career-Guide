# PDF Parser Backend (Cloudflare Worker)

This is a free serverless function to extract text from PDF files.

## Setup Instructions

### 1. Create Cloudflare Account (Free)
1. Go to https://dash.cloudflare.com/sign-up
2. Create a free account
3. Go to "Workers & Pages" in the sidebar

### 2. Install Wrangler CLI
```bash
npm install -g wrangler
wrangler login
```

### 3. Deploy the Worker
```bash
cd backend
npm install
wrangler deploy
```

### 4. Get Your Worker URL
After deployment, you'll get a URL like:
`https://pdf-parser.<your-subdomain>.workers.dev`

### 5. Update Your App
Add this URL to your `src/config/env.ts`:
```typescript
export const PDF_PARSER_URL = 'https://pdf-parser.<your-subdomain>.workers.dev';
```

## API Usage

**POST /parse**
- Body: FormData with `file` field containing PDF
- Returns: `{ text: "extracted text content" }`

## Free Tier Limits
- 100,000 requests/day
- 10ms CPU time per request
- Perfect for personal/small apps
