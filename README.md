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
| Frontend | HTML, CSS, JavaScript |
| Data Storage | Browser localStorage |
| AI Integration | Gemini |
| Version Control | Git + GitHub |
| Project Tracking | GitHub Projects |

## Getting Started

### Prerequisites

* [Git](https://git-scm.com/)
* A web browser (Chrome, Firefox, or Edge)
* [VS Code](https://code.visualstudio.com/) with the **Live Server** extension (recommended)
* A Gemini API key (only needed for the AI features, never commit it)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/MylikGreen/Group-D-Ticket_To_Go
   cd Group-D-Ticket_To_Go
```

2. **Add your API key**
   Copy `js/config.example.js`, rename the copy to `js/config.js`, and put your key in it.
   `config.js` is in `.gitignore` so keys never get pushed.

3. **Run the app**
   * **With Live Server:** open the folder in VS Code, right click `index.html`, and pick **Open with Live Server**.
   * **Without it:** double click `index.html` to open it in your browser.

## Project Structure

```
Group-D-Ticket_To_Go/
├── index.html              # Home page
├── pages/
│   ├── decks.html          # Create and manage decks
│   ├── study.html          # Study mode
│   └── assistant.html      # AI assistant
├── css/
│   └── style.css           # Styles for every page
├── js/
│   ├── main.js             # Shared code (nav, saving data)
│   └── config.example.js   # Template for the API key
├── assets/
│   └── images/             # Images and screenshots
├── .gitignore
└── README.md
```

## Project Backlog

All user stories, tasks, and bugs are tracked on our **GitHub Project board**:
https://github.com/MylikGreen/Group-D-Ticket_To_Go/blob/main/backlog.md

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
| Lucia Nguyen | Sprint Master | lunamiel |
| Mylik Green | Product Owner | @MylikGreen |
| Lucas Guenther | System Analyst | @lucasguenther24 |
| Henry Nguyen | QA Specialist | @HN2028 |
| Lawson Barton | Designer | @LawBarton |

*Scrum Master (Week Leader) rotates each sprint.*

## Screenshots

<img width="2240" height="1113" alt="Screenshot 2026-09-24 at 20 33 54" src="https://github.com/user-attachments/assets/e7fb5225-ce95-40e9-b569-2ddb9afad8c1" />

<img width="2240" height="1109" alt="Screenshot 2026-09-24 at 20 34 23" src="https://github.com/user-attachments/assets/2b1c11c2-c926-496f-b6a3-1a4330fba928" />


