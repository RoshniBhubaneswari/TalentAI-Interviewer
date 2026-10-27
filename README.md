# 🎙️ AI-Powered Mock Interview System

An AI-powered interview preparation platform designed to help students and job seekers practise interviews, improve their answers, and build confidence through interactive mock interview sessions.

The application uses the **MERN stack** and the **OpenRouter AI API** to generate interview questions and provide intelligent feedback. It can be extended with Speech-to-Text (STT) and Text-to-Speech (TTS) capabilities to enable a natural, voice-based interview experience.

## ✨ Features

- **AI-Generated Interview Questions:** Generate interview questions based on the selected role or topic.
- **Interactive Mock Interviews:** Practise answering questions in a simulated interview environment.
- **AI-Powered Feedback:** Analyze candidate responses and provide suggestions for improvement.
- **Speech Recognition (STT):** Enable spoken answers to be converted into text.
- **Speech Synthesis (TTS):** Enable interview questions and feedback to be read aloud.
- **User-Friendly Interface:** Simple and interactive interface for interview preparation.

> Speech recognition and speech synthesis features depend on their implementation in the current version of the project.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| MongoDB | Database, if configured |
| Express.js | Backend API framework |
| React.js | Frontend user interface |
| Node.js | Server-side runtime |
| OpenRouter AI API | AI-powered question generation and feedback |
| Web Speech API / Speech Services | Speech recognition and synthesis, when integrated |

## 🏗️ System Workflow

1. The candidate selects an interview topic or job role.
2. The AI generates relevant interview questions.
3. The candidate submits an answer through the available input method.
4. If speech recognition is enabled, spoken answers are transcribed into text.
5. The response is processed by the AI service.
6. Feedback is displayed to help the candidate improve.
7. If speech synthesis is enabled, questions and feedback can be played as audio.

## 🚀 Getting Started

### Prerequisites

- Node.js and npm
- Git
- An OpenRouter API key
- MongoDB, if required by the current implementation

### Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_PROJECT_FOLDER>
```

Install dependencies in the relevant frontend and backend directories:

```bash
npm install
```

If the project has separate frontend and backend folders, run `npm install` in each folder containing a `package.json`.

### Environment Variables

Create a `.env` file in the backend directory and add the configuration required by your implementation:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000
```

Add any other environment variables required by your project. Never commit API keys or other secrets to GitHub.

### Run the Application

Use the scripts defined in each directory's `package.json`. For example, if your project has separate frontend and backend applications:

```bash
# Backend
npm run dev

# Frontend
npm run dev
```
## 🎯 Project Objectives

- Make interview practice accessible and interactive.
- Help candidates improve their technical and communication skills.
- Demonstrate the practical use of generative AI in interview preparation.
- Explore the integration of speech recognition and speech synthesis in real-world applications.

## 🔮 Future Enhancements

- Real-time speech transcription.
- Spoken AI interview questions and responses.
- Pronunciation and speech fluency analysis.
- Interview performance tracking.
- Support for multiple languages.
- Role-specific interview question sets.
- Personalized improvement recommendations.

## 🎓 Academic Relevance

This project demonstrates the application of Artificial Intelligence, full-stack web development, and conversational interfaces. With speech recognition and speech synthesis integrated, it can also serve as a practical demonstration of Automatic Speech Recognition (ASR) and Text-to-Speech (TTS) technologies.
---

**Developed as an AI-powered interview preparation project using the MERN stack and OpenRouter AI API.**
