# Screenplay Generator & Player

A full-stack application that generates multilingual screenplays using AI with structured output and plays them back with text-to-speech.

## Features

- AI-powered screenplay generation using OpenRouter API with structured JSON output
- Multilingual dialogue support (16 languages)
- Configurable screenplay language for scene descriptions and directions
- Interactive expandable/collapsible JSON viewer for screenplay structure
- Text-to-speech playback with narrator mode
- Response format schema visualization
- Professional screenplay formatting

## Setup

```bash
npm install
```

## Configuration

The application uses `config.json` for API configuration and `responseFormat.json` for the screenplay structure schema.

## Running the Application

### Development Mode (Both Server and Client)
```bash
npm run dev
```

This will start:
- Express server on http://localhost:3000
- Vite dev server on http://localhost:5173 (with proxy to backend)
- Swagger API docs on http://localhost:3000/api-docs

### Run Server Only
```bash
npm run start
```

### Run Client Only
```bash
npm run client
```

### Build for Production
```bash
npm run build
```

## API Endpoints

### Screenplay Generation
```bash
POST /screenplay/generate
Content-Type: application/json

{
  "story_pitch": "A story about...",
  "languages_used": ["English", "Spanish", "Hebrew"],
  "default_screenplay_language": "Hebrew"
}
```

### Get Response Format Schema
```bash
GET /screenplay/format
```

### Chat API
- `POST /chat` - Create new chat
- `POST /chat/:chatId/message` - Add user message
- `POST /chat/:chatId/response` - Get AI response
- `POST /chat/:chatId/branch` - Create branch
- `GET /chat/:chatId/messages` - Get all messages

### OpenRouter SDK
```bash
POST /sdk/query
Content-Type: application/json

{
  "input": "Your query here"
}
```

Visit http://localhost:3000/api-docs for full API documentation.

## UI Features

- **Response Format Viewer**: Expandable view of the JSON schema used for screenplay generation
- **Story pitch Input**: Optional text input for custom story concepts
- **Language Selection**: Multi-select checkboxes for character dialogue languages
- **Default Screenplay Language**: Dropdown for selecting the language used in scene descriptions and directions
- **Generated Output**: Two views:
  - Complete Structure: Interactive JSON tree viewer with expand/collapse functionality
  - Readable Format: Traditional screenplay formatting with scene headings, descriptions, and dialogue

## Technologies

- **Frontend**: React + Vite
- **Backend**: Express.js
- **AI**: OpenRouter API with structured output and response healing
- **TTS**: Web Speech API


TODOs:
------
- allow to dynamicly set speed
- fix highlight spoken word (currently not in sync)
- 