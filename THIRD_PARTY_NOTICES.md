# Third-party notices

This project bundles or depends on the following open-source libraries.
Versions reflect the lockfile at the time of writing; each library retains
its own license and copyright.

## Runtime dependencies (bundled into the site)

| Library | Version | License | Purpose |
| --- | --- | --- | --- |
| react | 19.x | MIT | UI framework |
| react-dom | 19.x | MIT | DOM renderer |
| gpt-tokenizer | 3.x | MIT | Real cl100k_base (GPT-4) tokenizer, used client-side by the Tokenizer Microscope module |

## Development dependencies (not shipped to users)

| Library | Version | License | Purpose |
| --- | --- | --- | --- |
| vite | 7.x | MIT | Build tool and dev server |
| @vitejs/plugin-react | 4.x | MIT | React integration for Vite |
| typescript | 5.x | Apache-2.0 | Type checking |

## External services

The Real Chatbot Bridge module contains outbound links to external chatbot
services (for example ChatGPT, Claude, Gemini). These are independent
services with their own terms of use and privacy policies; this project does
not call them programmatically and is not affiliated with them.

Poll links (Slido, Mentimeter, Google Forms, or similar), when configured by
the instructor, also point to independent external services.
