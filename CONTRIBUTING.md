# Contributing to WDD

First off, thank you for taking the time to contribute! 🎉

WDD is an open-source project designed to explore AI-powered music recommendation systems and learn modern full-stack development patterns. We welcome contributions of all shapes and sizes, whether it is fixing a bug, adding a new feature, improving documentation, or optimizing performance.

---

## Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [How Can I Contribute?](#how-can-i-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Enhancements](#suggesting-enhancements)
   - [Beginner-Friendly Contributions](#beginner-friendly-contributions)
3. [Development Workflow](#development-workflow)
   - [Forking the Repository](#1-fork-the-repository)
   - [Creating Feature Branches](#2-create-a-feature-branch)
   - [Coding Standards & Formatting](#3-coding-standards--formatting)
   - [Commit Message Guidelines](#4-commit-message-guidelines)
   - [Submitting a Pull Request](#5-submit-a-pull-request)
4. [Project Layout](#project-layout)

---

## Code of Conduct

This project and everyone participating in it is governed by the [WDD Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to **[welcomedeardreamers@gmail.com]**.

---

## How Can I Contribute?

### Reporting Bugs
If you find a bug in the application, please search existing issues to see if it has already been reported. If it hasn't, open a new issue and include:
* A clear, descriptive title.
* Steps to reproduce the bug.
* Expected vs. actual behavior.
* Environment details (browser, OS version, Python version, Node version).
* Relevant logs or screenshots.

### Suggesting Enhancements
If you have ideas for new features or improvements:
* Check if there is an existing issue or discussion.
* Open a new issue describing the feature, why it is useful, and how it might be implemented.

### Beginner-Friendly Contributions
Are you new to open-source or this tech stack? Look for issues labeled `good first issue` or `documentation`. These issues are scoped to be straightforward and a great way to get familiar with our development workflow. 

We are also very happy to help guide you through the process, so feel free to ask questions directly in issue comments!

---

## Development Workflow

### 1. Fork the Repository
First, fork the [WDD repository](https://github.com/djeugoou/Music-recommender) to your own GitHub account. Then, clone your fork locally:

```bash
git clone https://github.com/djeugoou/Music-recommender.git
cd Music-recommender
```

Add the original repository as an `upstream` remote so you can stay in sync:
```bash
git remote add upstream https://github.com/djeugoou/Music-recommender.git
```

### 2. Create a Feature Branch
Create a branch for your work. Use a descriptive branch name with a standard prefix:
* `feature/` for new features (e.g., `feature/parallel-deezer-queries`)
* `bugfix/` for bug fixes (e.g., `bugfix/fix-audio-preview-crashes`)
* `docs/` for documentation updates (e.g., `docs/add-api-endpoints`)
* `refactor/` for code refactoring (e.g., `refactor/unify-state-management`)

```bash
# Get the latest changes from upstream
git checkout main
git pull upstream main

# Create and switch to your feature branch
git checkout -b feature/your-feature-name
```

### 3. Coding Standards & Formatting
To keep the codebase uniform and readable, please adhere to these guidelines:

#### Backend (Python & FastAPI)
* Follow [PEP 8](https://peps.python.org/pep-0008/) style standards.
* Use type hints wherever possible to document function signatures.
* Ensure you create a virtual environment (`venv`) and only import dependencies listed in `backend/requirements.txt`.
* If you introduce a new dependency, add it to `backend/requirements.txt`.

#### Frontend (React + TypeScript)
* We use TypeScript for static typing. Avoid using `any` types; define interfaces or types in the `frontend/src/types/` folder.
* We style elements with Tailwind CSS. Follow the existing utility class structures and keep styling consistent.
* We leverage shadcn/ui components where applicable.

### 4. Commit Message Guidelines
We encourage the use of [Conventional Commits](https://www.conventionalcommits.org/) to make git history clean and readable. Commit messages should be structured as follows:

```
<type>(<scope>): <short description>
```

* **Types**:
  * `feat`: A new feature
  * `fix`: A bug fix
  * `docs`: Documentation only changes
  * `style`: Changes that do not affect the meaning of the code (formatting, white-space, etc.)
  * `refactor`: A code change that neither fixes a bug nor adds a feature
  * `test`: Adding missing tests or correcting existing tests
  * `chore`: Changes to the build process or auxiliary tools and libraries
* **Scope**: Optional, references the component affected (e.g., `backend`, `frontend`, `auth`, `favorites`).

**Example**:
```
feat(backend): add route to fetch user recommendation history
fix(frontend): resolve sizing issue on mobile song card layout
docs(root): update readme with docker instructions
```

### 5. Submit a Pull Request
Once your changes are ready and tested:
1. Push your branch to your GitHub fork:
   ```bash
   git push origin feature/your-feature-name
   ```
2. Navigate to the original AI-Music repository on GitHub.
3. Click **Compare & pull request**.
4. Fill out the PR template, describing:
   * What changes were made.
   * Why they were made.
   * How you tested them.
   * Any visual modifications (include screenshots or videos if frontend-related).
5. Link any related issues (e.g., `Closes #12`).
6. A maintainer will review your code. Address any review feedback constructively and push updates directly to your branch.

---

## Project Layout

Here is a quick map of where things reside in the repo:
* `/backend`: FastAPI backend code, OpenAI integration, Deezer client, and Supabase context orchestrator.
* `/frontend`: Vite-powered React and TypeScript frontend, including shadcn components and Supabase Auth configurations.
* `/supabase`: SQL migration scripts and Row Level Security (RLS) setup policies.
* `/docs`: Expanded technical documentation (e.g., [code-architecture.md](docs/code-architecture.md)).

Thank you again for contributing! If you get stuck at any point, reach out by opening a discussion or commenting on your issue.
