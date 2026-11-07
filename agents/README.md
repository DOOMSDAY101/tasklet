# DevCrew agents

Each agent is a separate Switch agent running on OpenCode, with its own folder, instructions and role boundary. The instructions in each `<name>.md` file are pasted into the agent's Console form. These files are the source of truth.

| Agent     | Role                        | Core job                                                         |
| --------- | --------------------------- | ---------------------------------------------------------------- |
| Conductor | The Orchestrator            | Routes requests, asks for approval, reports status               |
| Forge     | The Builder                 | Turns requests into tested code on a branch, merges on "ship it" |
| Scout     | The Project Analyst         | Finds bugs, debt and missing tests, reports ranked findings      |
| Sentinel  | The Code Reviewer           | Independently verifies Forge's branches                          |
| Pulse     | The Team Reporter           | Standups from git history and room activity                      |
| Kudos     | The Team Appreciation Agent | Evidence-based Contribution Moments, no rankings                 |

## Triggers

| Trigger              | Agent     | Expected result        |
| -------------------- | --------- | ---------------------- |
| New feature request  | Conductor | Delegates the task     |
| Coding request       | Forge     | Implements the feature |
| Project health check | Scout     | Improvement report     |
| Code change          | Sentinel  | Independent review     |
| Morning stand-up     | Pulse     | Daily summary          |
| Project milestone    | Kudos     | Team appreciation      |

## Permissions

| Agent     | Can do                                                                           | Cannot do                               |
| --------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| Forge     | Read, edit, run commands, commit and push `forge/*` branches, merge on "ship it" | Push to main or merge without "ship it" |
| Scout     | Read, run tests and typecheck                                                    | Edit files, commit, push                |
| Sentinel  | Read, run tests and typecheck                                                    | Edit files, commit, push                |
| Pulse     | Read git history and room messages                                               | Edit files, commit, push                |
| Kudos     | Read git history and room messages                                               | Edit files, commit, push                |
| Conductor | Coordinate and delegate                                                          | Touch the repo at all                   |

"Read-only" means no file edits, commits or pushes. Read-only agents may still run commands such as tests. These limits are enforced by each agent's instructions.

## Flow

Human request -> (Conductor) -> Scout finds -> human approves -> Forge builds and pushes -> Sentinel reviews -> human says "ship it" -> Forge merges -> Pulse reports -> Kudos recognizes.
