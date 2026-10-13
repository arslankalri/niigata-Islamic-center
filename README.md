# Niigata Ic Dome Web

Project: Islamic Center Niigata — Official Website

Build a professional, modern, mobile-first website for Islamic Center Niigata, a real mosque and Muslim community center in Niigata, Japan.

This is a new project. Establish the website’s visual identity, page structure, navigation, and homepage from scratch.

1. Design vision

Create a distinctive Islamic architectural aesthetic that feels peaceful, dignified, welcoming, and contemporary.

Use the actual mosque photographs supplied with this project as the primary visual reference.

The real building has:

* A white exterior.
* A green dome.
* Slender minaret-like towers.
* Arched window details.
* Islamic calligraphy above the entrance.
* Green architectural lighting at night.

Use these real architectural features to inspire the website’s design. Do not substitute a generic mosque building or use AI-generated architecture in place of the actual center.

Color palette

* Deep emerald green: primary brand color.
* Dark forest green: navigation and dark sections.
* Warm ivory: page backgrounds.
* Muted gold: restrained decorative accents.
* White: content surfaces.
* Charcoal: readable body text.

Use subtle Islamic geometric patterns, elegant arches, refined typography, generous spacing, and tasteful transitions. Avoid excessive ornamentation, flashy animations, generic SaaS styling, and unnecessary gradients.

The website should look custom-designed, polished, and trustworthy.

2. Branding

Use the exact English organization name:

Islamic Center Niigata

Create a clean, text-based temporary wordmark until an official logo is supplied. Do not invent or claim to reproduce an existing official logo.

Keep the organization name consistent throughout the header, footer, page titles, and metadata.

3. Languages

Support three languages throughout the website:

* Japanese — 日本語
* English
* Urdu — اردو

Include a visible language selector in the desktop navigation and mobile menu.

Requirements:

* Translate navigation labels and all public interface text.
* Use centralized translation dictionaries.
* Implement correct right-to-left layout for Urdu.
* Update document language and direction when switching languages.
* Ensure Urdu text is legible and correctly aligned.
* Preserve the selected language when navigating between pages.
* Do not display a mixture of untranslated interface labels.

Use Japanese, English, and Urdu as equal supported languages.

4. Website pages

Establish these routes and a consistent design across them:

1. Home
2. Prayer Times
3. About the Center
4. Announcements
5. Events
6. Visit Us
7. Facebook Community

Each route must have a coherent page layout, shared navigation, and footer. Use clearly marked placeholder content wherever verified information has not yet been provided.

Do not invent the center’s address, history, leadership, contact details, or prayer schedule.

5. Homepage

Build a visually striking homepage.

Hero section

* Use the actual supplied mosque exterior photograph as the main visual.
* Display the heading “Islamic Center Niigata”.
* Add a short, neutral welcome message that can be edited later.
* Include prominent buttons for Prayer Times and Visit Us.
* Include a secondary About Us link.
* Ensure excellent text contrast over the photograph.

Supporting sections

* Prayer-times preview with a clear notice that the official live schedule integration is pending.
* Latest announcements.
* Upcoming events.
* An introduction to the center.
* A visit and directions section.
* A Facebook Community section.
* A complete footer with navigation and language options.

Keep sections concise and visually balanced. The homepage should communicate the center’s identity immediately without overwhelming visitors.

6. Prayer-times page

Create the visual structure for Fajr, Dhuhr, Asr, Maghrib, Isha, and Jumu’ah.

The mosque uses an existing QR code to access its prayer schedule. The QR code and destination have not yet been integrated.

For now:

* Clearly mark the schedule integration as pending.
* Do not invent prayer times.
* Do not substitute calculated prayer times.
* Reserve space for the verified official schedule and its source.
* Design the page to accommodate separate adhan and iqamah times if provided.

We will implement the actual schedule connection after inspecting the QR code and verifying how its destination provides data.

7. Announcements, events, and Facebook

Create polished layouts for official announcements and upcoming events, using clearly labeled sample placeholders rather than invented real announcements.

The Facebook Community page should have a prominent link to the official Facebook source once supplied.

Do not claim automatic Facebook Group synchronization until a supported integration has been verified.

8. Visit Us page

Design a page for the mosque’s verified address, map, directions, transport information, and visitor guidance.

Do not guess the address or insert a potentially incorrect map location. Leave clearly labeled placeholders until the correct details are confirmed.

9. Technical requirements

Use the existing supported Lovable stack and conventions, with React, TypeScript, reusable components, and responsive layouts.

Requirements:

* Mobile-first responsive design.
* Accessible navigation and keyboard controls.
* Semantic HTML and appropriate contrast.
* Optimized photographs.
* Sensible image alternative text.
* SEO-friendly page titles and descriptions.
* Working navigation and buttons.
* No broken routes, fake functionality, or unnecessary dependencies.

Use a maintainable component structure so future database and authentication integration will not require rewriting the entire frontend.

10. Strict scope for this first prompt

For this first stage, build only:

* The visual design system.
* The shared header, navigation, and footer.
* The language-switching foundation.
* The homepage.
* The layouts and routes for the remaining public pages.
* Responsive desktop and mobile behavior.

Do not implement:

* Database integration.
* Admin authentication.
* Donation or payment functionality.
* Automated prayer-time calculations.
* Facebook feed synchronization.
* A fabricated prayer schedule.

These features will be handled in later stages after the initial design is reviewed.

11. Completion criteria

Before finishing:

* Confirm all seven routes exist and are navigable.
* Check the desktop and mobile layouts.
* Verify Japanese, English, and Urdu switching.
* Check Urdu right-to-left rendering.
* Use the actual supplied mosque photographs.
* Ensure no invented organizational facts appear.
* Report any remaining placeholders and unimplemented functionality.

Start by building the complete visual foundation. Prioritize design quality, authentic mosque photography, usability, and a consistent identity over adding extra features.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://niigata-ic-dome-web.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5858dbb0-6c0a-46de-8bb2-d1653642c1fe).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
