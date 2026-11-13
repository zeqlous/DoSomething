# DoSomething: Prototype V3

*Last updated: November 2026*

DoSomething is a prototype for browsing and signing up for volunteer opportunities in Lincoln, Nebraska. Listings are posted by our team on the backend (simulated here with hardcoded data); visitors only browse and sign up. Accounts, signups, and favorites are stored in the visitor's browser. The app is built with Angular standalone components, signals, and zoneless change detection, and is hosted on GitHub Pages.

**Intended users:** Students and Lincoln residents seeking volunteer experience across organizations while keeping shifts in one schedule.

**Live site:** [https://zeqlous.github.io/DoSomething/](https://zeqlous.github.io/DoSomething/)

## Core tasks

These are the tasks used in usability testing.

1. **Create an account and return home.** From Opportunities, select **Sign Up Today!**, complete the form, choose **Create Account**, then **Home**. Success: the home page shows your name at the top right.
2. **View scheduled events.** Select **My Schedule** in the main navigation, then **My Shifts** in the Volunteer Hub. Success: your upcoming signups appear in the list.
3. **Volunteer for an event.** On Opportunities, choose an event's **Volunteer** action and sign in or create an account if prompted. Success: the event appears under **Your upcoming shifts** on the home page.

**Error paths that work:** empty or invalid form fields, passwords shorter than six characters, duplicate email, incorrect login credentials, volunteering while signed out (you are prompted to sign in or sign up), saving an organization while signed out, signing up for a past event (blocked with a message), cancelling a shift (requires confirmation), and searches with no results (offer **Clear filters**).

## V3 features

- Event listings show organization, category, date, start and end times, venue, and description, with an explicit **Details** button on each card in addition to clicking the card.
- Search, category, and favorite-organization filters for opportunities.
- Month calendar with fixed-size date cells and a **+N more** indicator.
- **My Shifts** and **Past Shifts** tabs with search and organization filters.
- Profile page with member-since date, shift counts, hours, and favorite organizations.
- Responsive layout: the schedule sidebar stacks above the calendar on screens 700px wide and narrower, and the header wraps below 380px.
- Accessibility: skip link, Tab/Shift+Tab focus trap in dialogs, screen-reader labels, darker form-control borders, status live regions, and reduced-motion support.

## Run locally

Requires Git and Node.js 20.19+, 22.12+, or 24+ (matching the Angular 21 toolchain).

```bash
git clone https://github.com/zeqlous/DoSomething.git
cd DoSomething
npm install
npm start
```

For a GitHub Pages build:

```bash
npm run build -- --base-href /DoSomething/
```

The app uses hash routing so page refreshes work on Pages.

## Resetting between test sessions

Accounts and shifts are stored in the browser's `localStorage`, and logging out keeps the account. Before each participant, open DevTools **Application > Storage** and choose **Clear site data**, or use a fresh private window.

## Project structure

```text
src/
├── app/
│   ├── app.ts / app.html / app.css              # Root layout, navigation, dialogs
│   ├── app.config.ts / app.routes.ts            # Providers and routes
│   ├── store.ts                                  # Events, accounts, signups, favorites
│   ├── initials.ts                               # Shared name-initials helper
│   ├── home.ts / home.html / home.css            # Opportunities and upcoming shifts
│   ├── schedule.ts / schedule.html / schedule.css # Calendar and shift lists
│   ├── profile.ts / profile.html / profile.css   # Volunteer profile and organizations
│   ├── signup.ts / signup.html / signup.css      # Account creation and login
│   ├── icon.ts                                   # Inline icon component
│   ├── event-thumb.ts                            # Event image or icon thumbnail
│   └── volunteer-action.ts                       # Volunteer and cancel actions
├── main.ts                                       # Application entry point
├── index.html                                    # Document shell
└── styles.css                                    # Global styles and design tokens
```

### Add an event

Add an entry to the `events` array in `src/app/store.ts`. Events use `date` in `yyyy-mm-dd` format, `time` for the start, and `endTime` for the end. Each listing needs `venue`, `org`, `category`, `imageAlt`, and an `icon` from `src/app/icon.ts`, along with its ID, title, location, details, and image URL (`''` uses the icon tile).

## Known limitations and simulated functionality

- **Simulated:** the backend, authentication, organization data, and "Completed" status are all simulated in the browser.
- There is no backend; accounts, signups, and favorites are stored locally per browser and device and are lost if browser data is cleared.
- Passwords use salted client-side SHA-256 (one-way hashing) for this demo only; this is not suitable for production authentication.
- Sample events, organizations, and venues are hardcoded.
- "Completed" status and hours are inferred from the event end time; there is no check-in.
- Favorites only filter the event list; organization logos are not included.
- Focus is not always returned to the opening control after a dialog closes.
- Screen-reader support has not been tested with every screen reader.
