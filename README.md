# Q&A Assistant

An interactive AI chatbot for learning how AI works — covering prompts, memory, context windows, and chatbot UX design patterns.

## Features

- **Conversational Q&A** — ask questions about AI concepts and get detailed answers
- **Suggested follow-ups** — contextual follow-up questions appear after each AI reply
- **Copy messages** — hover any message to copy it to clipboard
- **Reactions** — thumbs up / down on AI responses
- **Message search** — search through your conversation history in real time
- **Export chat** — download the full conversation as a `.txt` file
- **Character counter** — live count while typing, with a 500-character limit
- **Dark / light mode** — toggle between themes with the sun/moon button
- **Learn panel** — expandable concept cards covering Prompts, Memory, Context, and UX Patterns
- **Session stats** — live token estimate, message counts, and reaction tracking

## Topics Covered

| Topic | Description |
|---|---|
| Prompts | What they are and how to write effective ones |
| Memory | How AI remembers (and forgets) within a session |
| Context windows | Token limits and how they shape responses |
| UX Patterns | Design principles for conversational interfaces |
| Prompt Engineering | Advanced techniques: role prompting, few-shot, chain-of-thought |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite 8** — build tooling and dev server
- **Tailwind CSS v4** — utility-first styling
- **Google Fonts** — DM Serif Display, Outfit, JetBrains Mono

## Getting Started

```bash
pnpm install
pnpm dev
```

The app runs on `http://localhost:8443` by default.

## Project Structure

```
src/
├── App.tsx       # Main application component
├── index.css     # Global styles, tokens, and animations
└── main.tsx      # React entry point
index.html        # HTML shell
```
**Live demo**:https://aichatbot-sandy-iota.vercel.app/
