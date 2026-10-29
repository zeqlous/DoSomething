# DoSomething Website--Prototype V2

A webapp for posting and signing up for public local volunteer listings. (posting will be handled by us on the backend, and it is assumed that general users will not be able to access that backend directly)
Built with Angular (standalone components, zoneless change detection, signals) and published to GitHub Pages.

## Features

**Implemented**
- Browse open and past volunteer opportunities on the home page
- Volunteer for (and cancel) an opportunity
- Month-view calendar of all opportunities, with a day-detail panel
- "My Shifts" tab listing everything you've signed up for
- Sign up for an account (stored for the current browser session only)
- Header shows the logged-in user's name, with a Log out button

**In progress:** see the [Planned Improvements](#planned-improvements) checklist below.

**Future:** pull events (image URL, title, details, etc.) from a database instead of the hardcoded list.

---

## User Tasks and Accessing the Site (TAs and Alisha)

**Our site is published to GitHub Pages at: [DoSomething.com](https://zeqlous.github.io/DoSomething/)**

* **Task 1:** Create a Volunteer App account, then return to the main page.
  *Navigation: Home → "Sign Up Today!" (or "Sign Up" in the header) → fill in the form → Create Account → Home*
* **Task 2:** Visit your schedule and find what events you have scheduled.
  *Navigation: Header 📅 icon (or your name) → "Upcoming Events" / "My Shifts" tab*
* **Task 3:** Register for a new volunteer experience.
  *Navigation: Home → "Open Opportunities" → Volunteer (you'll be sent to Sign Up first if you have no account). You can also pick a day on the calendar and click Volunteer.*

> **Note:** Accounts and signups are saved in `sessionStorage`. They survive a page refresh but are cleared when the tab is closed or when you log out. The password is validated but never stored (there is no backend yet).

---

## Start Developing

### Prerequisites
* **Node.js** v18+ (check with `node -v`, or install from nodejs.org)
* **Git** (check with `git --version`)

### Clone and install
```bash
git clone https://github.com/zeqlous/DoSomething.git
cd DoSomething
npm install
```

### Run a local dev server
```bash
ng serve
```
- **Open the site:** click the link that appears in the terminal.
- **Close the site:** `Ctrl+C` (then `Y`), or type `q` and press Enter.

### Build and deploy to GitHub Pages
```bash
ng build --base-href /DoSomething/
```
Publish the contents of `dist/<project-name>/browser` to GitHub Pages.
The app uses hash routing (e.g. `/#/schedule`), so refreshing any page works on Pages without extra 404 configuration.

---

## File Structure

The structure is intentionally flat: one folder, with a TypeScript / HTML / CSS file per page.

```
src/
├── app/
│   ├── app.ts / app.html / app.css    # Root component: persistent header + <router-outlet>
│   ├── app.config.ts                  # App providers (zoneless change detection, hash routing)
│   ├── app.routes.ts                  # URL → component mappings
│   ├── store.ts                       # Shared data + session state (events, account, signups)
│   ├── home.ts / .html / .css         # Home page (open + past opportunities)
│   ├── schedule.ts / .html / .css     # Calendar view + "My Shifts"
│   └── signup.ts / .html / .css       # Account creation + confirmation
├── index.html                         # Main HTML shell
├── main.ts                            # App entry point
└── styles.css                         # Global CSS (palette variables planned here)
```

### How the files communicate

1. **`main.ts`** boots `AppComponent` (`app.ts`) inside **`index.html`** (`<app-root>`).
2. **`app.routes.ts`** swaps pages into the `<router-outlet>` based on the URL.
3. **`store.ts`** is an injectable service shared by every page. It holds:
   - `events`: the list of opportunities (hardcoded for now; replace with a `fetch()` to your database later)
   - `account`: the signed-in user (a `signal`, saved to `sessionStorage`)
   - `joinedIds`: the events the user has signed up for
   - helpers like `toggle(id)`, `register()`, `logout()`
4. Each page component injects the store (`store = inject(Store)`) and reads its signals in the template, so a change on one page (e.g. volunteering on Home) shows up everywhere (e.g. the Schedule calendar).

### Common tasks

**Edit an existing page:** open the component's `.ts`, `.html` or `.css` file in `src/app/`, edit, and save. The browser auto-reloads.

**Add or change an event:** edit the `events` array in `src/app/store.ts`. Dates use ISO format (`yyyy-mm-dd`). Leave `imageUrl` as `''` to show the emoji icon instead of an image.

**Add a new page route:** create the component, then add it in `src/app/app.routes.ts`:
```typescript
import { PageNameComponent } from './page-name';

export const routes: Routes = [
  { path: 'page-name', component: PageNameComponent }
];
```

### Environment variables / API keys
If we use API keys for a database at any point, they will go in a `.env` file which **DOES NOT GET PUSHED**. These keys will be deployed from the GitHub "Environment Secrets" page :)

---

## Known Limitations
- Data resets when the browser tab is closed (session-only storage; no database yet).
- Logging out clears the account and its signups.
- Passwords are not stored or verified.
- The event list is hardcoded in `store.ts`.
