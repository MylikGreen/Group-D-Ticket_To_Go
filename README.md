# Study To-Go

**Study To-Go** is a study companion web app that helps students learn faster with digital flashcards and an AI study assistant. Students can create card decks, study them in a card based format, and ask the AI assistant to explain concepts, quiz them, or generate flashcards from their notes.

> CS3203 Software Engineering, Fall 2026, University of Oklahoma (Group D)

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Getting Started](#getting-started)
* [Project Structure](#project-structure)
* [Project Backlog](#project-backlog)
* [Contributing](#contributing)
* [Team](#team)

## Features

**Planned for the MVP:**

* **Flashcard decks:** create, edit, and delete decks and cards
* **Card based study mode:** flip cards, mark them as known or still learning, and track progress
* **AI study assistant:** ask questions about a topic, get explanations, and get quizzed
* **AI flashcard generator:** paste notes and automatically generate a deck
* **User accounts:** sign up and log in so decks are saved

**Stretch goals:**

* Spaced repetition scheduling
* Sharing decks with classmates
* Study streaks and progress stats

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | [e.g. React + Vite] |
| Backend | [e.g. Node.js + Express] |
| Database | [e.g. MongoDB / PostgreSQL / Firebase] |
| AI Integration | [e.g. OpenAI API / Claude API / Gemini API] |
| Version Control | Git + GitHub |
| Project Tracking | GitHub Projects |

*Bracketed items are placeholders. Update them once the team finalizes the stack.*

## Getting Started

### Prerequisites

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) version 18 or newer (if using a JavaScript stack)
* An API key for the AI service (ask the team lead; never commit it)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/[OWNER]/[REPO-NAME].git
   cd [REPO-NAME]
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the project root:
   ```
   AI_API_KEY=your_key_here
   DATABASE_URL=your_database_url_here
   ```
   `.env` is listed in `.gitignore` so secrets never get pushed.

4. **Run the app locally**
   ```bash
   npm run dev
   ```
   Then open `http://localhost:5173` (or the port shown in your terminal).

## Project Structure

```
study-to-go/
├── client/          # Frontend code (pages, components, styles)
├── server/          # Backend code (routes, controllers, AI integration)
├── docs/            # Planning documents, diagrams, screenshots
├── .gitignore
├── .env.example     # Template for environment variables
└── README.md
```

*This structure will be kept in sync with the repo as the project grows.*

## Project Backlog

All user stories, tasks, and bugs are tracked on our **GitHub Project board**:
[Link to project board]

Each ticket includes:

* A clear title and description
* Acceptance criteria
* A priority label (High / Medium / Low)
* An assignee and a sprint milestone

Tickets move through the columns **To Do → In Progress → In Review → Done**.

## Contributing

### Branching

* `main` holds stable, working code only. Do not push to it directly.
* Create a branch for each ticket, named after the ticket:
  ```bash
  git checkout -b feature/12-flashcard-editor
  ```
  Use `feature/`, `fix/`, or `docs/` as the prefix, followed by the issue number and a short name.

### Commits

Write short, clear commit messages that say what changed:

```
Add flip animation to study card
Fix login redirect after sign up
```

Reference the issue when relevant, e.g. `Closes #12`.

### Pull Requests

1. Push your branch and open a pull request into `main`.
2. Link the related issue in the description.
3. Get at least **one teammate's approval** before merging.
4. Move the ticket to **Done** on the project board after merging.

## Team

| Name | Role | GitHub |
|------|------|--------|
| Lucia Nguyen | [Role] | [@username] |
| Mylik Green | [Role] | [@username] |
| Lucas Guenther | [Role] | [@username] |
| Henry Nguyen | [Sprint Master] | [@HN2028] |
| Lawson Barton | [Designer] | [@LawBarton] |

*Scrum Master (Week Leader) rotates each sprint.*

## Screenshots

*Screenshots of the app will be added here as features are completed.*
