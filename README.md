# DoSomething: Prototype V3

DoSomething is a web app for browsing and signing up for public local volunteer opportunities in Lincoln, Nebraska, with team-posted listings managed through the backend process. This prototype uses hardcoded sample listings. Angular standalone components, signals, and zoneless change detection power the app, which is hosted on GitHub Pages.

**Intended users:** Students and Lincoln residents seeking volunteer experience across organizations while keeping shifts in one schedule.

**Live site:** [https://zeqlous.github.io/DoSomething/](https://zeqlous.github.io/DoSomething/)

## Core tasks

1. **Create an account and return home.** From Opportunities, select **Sign Up Today!**, complete the form, choose **Create Account**, then **Home**. Success: the home page shows your name at the top right.
2. **View scheduled events.** Select **My Schedule** in the main navigation, then **My Shifts** in the Volunteer Hub. Success: your upcoming signups appear in the list.
3. **Volunteer for an event.** On Opportunities, choose an event's **Volunteer** action and sign in or create an account if prompted. Success: the event appears under **Your upcoming shifts** on the home page.

## V3 features

- Event details show organization, category, date, start and end times, and venue.
- Search, category, and favorite-organization filters for opportunities; no-result states offer **Clear filters**.
- Month calendar with fixed-size date cells and a **+N more** indicator.
- **My Shifts** and **Past Shifts** tabs with search and organization filters.
- Profile with member-since date, shift counts, hours, and favorite organizations.
- Skip link, per-dialog focus restoration and a Tab/Shift+Tab focus trap, screen-reader labels, status live regions, and reduced-motion support.
- Sign-up and login errors cover empty or invalid fields, passwords shorter than six characters, duplicate email, and incorrect credentials. Past-event signups are blocked; cancelling a shift asks for confirmation. Signed-out visitors are prompted to sign in or sign up when volunteering or saving an organization.

## Run locally

Requires Node.js 18 or later.

```bash
git clone https://github.com/zeqlous/DoSomething.git
cd DoSomething
npm install
ng serve
```

For a GitHub Pages build:

```bash
ng build --base-href /DoSomething/
```

The app uses hash routing so page refreshes work on Pages.

Test accounts persist in this browser's `localStorage`; logging out keeps the account. To reset a test session, open DevTools **Application > Storage** and choose **Clear site data**, or use a fresh private window.

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

## Limitations

- There is no backend; accounts, signups, and favorites are stored locally per browser and device.
- Passwords use salted client-side SHA-256 for this demo only; this is not suitable for production authentication.
- Sample events, organizations, and venues are hardcoded.
- Logging out keeps the account and its saved shifts.
- “Completed” status and hours are inferred from the event end time; there is no check-in.
- Favorites only filter the event list; organization logos are not included.
- The app has not been audited with every screen reader.
