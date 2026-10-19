# DoSomething Website

**Features:**
- Search and register for volunteer experiences
- Look through registered events through built-in calendar
- Sign up / Login to account

**Start Developing:**

### Prerequisites
* **Node.js**: v18+ installed 
    Check installation with (`node -v`)
    Or go to the website and install it
* **Git**: Installed (`git --version`)

### To clone and install the project:
```bash
git clone <YOUR-REPOSITORY-URL>
cd <YOUR-PROJECT-FOLDER>
npm install
```

### "Running" the website/Starting a local dev server:
```bash
ng serve
```
- Opening the site: A link will appear in the terminal, click it.
- Closing the site: Either use Ctrl+C (and select Y), or type 'q' and press Enter

### General File Structure:

```
src/
├── app/
│   ├── app.ts            # Root component (main layout / state)
│   ├── app.routes.ts     # Route mappings (URLs to components)
│   ├── features/         # Individual pages (e.g., home, contact)
│   └── shared/           # Reusable components (Navbar, Footer, Buttons)
├── assets/               # Images, fonts, and static files
├── index.html            # Main HTML shell
├── main.ts               # App entry point
└── styles.css            # Global CSS / Tailwind directives
```

- Important Note: If we use api keys for a db at any point, they will got in a .env which DOES NOT GET PUSHED. These keys will be deployed from the github 'Environment Secrets' page :)

### More on Files Communicating with each other:

1. **`main.ts`** boots `app.ts` inside **`index.html`** (`<app-root>`).
2. **`app.routes.ts`** swaps components in `<router-outlet>` based on URL.
3. **`app.ts` (or component files)** contain template, styling, and reactive state (`signal()`).

### More More technically:
- To edit existing pages:
 - Open the target component file in `src/app/`, edit the template or logic, and save. The browser auto-reloads.

- To register a new page route:
 - Add the entry in `src/app/app.routes.ts`:
```typescript
import { PageNameComponent } from './features/page-name/page-name.component';

export const routes: Routes = [
  { path: 'page-name', component: PageNameComponent }
];
```