# hack2skill-cookingtodo

An AI-backed cooking micro-app that generates a personal meal plan from a user's
day profile, cuisine, food type, pantry, dietary needs, equipment, time, and
budget.

## Run

1. Copy `.env.example` to `.env`.
2. Add your `OPENAI_API_KEY` to `.env`.
3. Run:

```bash
npm start
```

4. Open `http://localhost:3000`.

## Public Deployment

The simplest deployment path for this app is a Node.js web service such as
Render, Railway, Fly.io, or an Azure App Service container/app. Static-only hosts
will not work by themselves because this app needs `server.js` to keep the
OpenAI API key private.

### Render

1. Push this folder to GitHub.
2. Create a new Render Web Service from the repo.
3. Use these settings:
   - Build command: `npm install`
   - Start command: `npm start`
   - Root directory: `warmup-challenge/hack2skill-cookingtodo` if deploying from
     the workspace root
4. Add environment variables in Render:
   - `OPENAI_API_KEY`: your real OpenAI key
   - `OPENAI_MODEL`: `gpt-5.4-mini`
   - `HOST`: `0.0.0.0`
5. Do not add `PORT`; Render provides it for the web service.

After deployment, Render will provide a public HTTPS URL.

### Security Checklist

- Never commit `.env`.
- Set secrets in the hosting provider's environment variable UI.
- Rotate any API key that was pasted into chat or committed by mistake.
- Keep `HOST=127.0.0.1` locally and use `HOST=0.0.0.0` only in hosted
  environments.

## Features

- Server-side OpenAI Responses API integration
- Flexible meal selection: breakfast, lunch, dinner, and snack
- Cuisine, food type, health goal, serving, equipment, and custom notes
- Grocery list that removes pantry items
- Constraint-aware substitutions
- Budget feasibility status with over-budget guidance
- Copyable cooking to-do list

## Security Notes

- The OpenAI API key is read only by `server.js` from `.env`.
- The browser calls `/api/plan`; it never receives the API key.
- Request bodies are size-limited and validated before being sent to OpenAI.
- Static responses include basic security headers and a strict content security
  policy.
- User text is rendered as escaped text in the UI.
