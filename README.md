<!-- @format -->

# ClassClarus

## Change Log

### 2026/01/05

-   BE: updated perms to allow teachers to see join codes
-   BUG: parents can now properly view the class their children are in
-   UI: added mobile-only tab labels to member management pages
-   BUG: member management tabs no longer extend past the viewport horizontally on mobile
-   BE: added lastLogon to $user table

### 2026/01/03

-   BE: changed join codes from 8 to 6 characters due to [the math](https://docs.google.com/spreadsheets/d/1b2ICoE1dsr3VMKftyfGpN8sAGM04QLoqnGSFdqcoVHI/edit?usp=sharing)
-   UI: added paste code buttons to magic-auth and /join
-   BE: refactored /join actions to reduce duplication and to send error to guests on the client, preventing unnecessary server action calls.

### 2026/01/02

-   BE: guests cannot joining orgs/classes
-   BE: users cannot join orgs/classes that are owned by guests
-   UX: user routed to / on logout
-   UI: removed "Back to Organizations" text from org page and org layout, replaced with just "Back"
-   UX: Dialogs are now credenzas, but they are very long and I'm not sure about the UX for long drawers/dialogs. Is there another pattern we can use?
-   UX: new orgs and classes are now redirected to
-   UI: added "What is an Organization" collapsible to the No Organizations card
-   BE: updated login methods to updated $user.created
-   DX: created the `AuthProvider` component to wrap app layout and provide auth context. Still need to fully implement

### 2026/01/01

-   security: moved join codes to separate entities (`orgJoinCodes`, `classJoinCodes`) with restricted permissions so only owners/admins can view them
-   feature: complete `/join` page for entering join codes
    -   8-character OTP-style input
    -   URL query parameter support (`?code=XXXXXXXX`) for direct joining via links
    -   organization join codes (joins user as student)
    -   class join codes for students, teachers, and parents
    -   parent flow with student selection UI to link children
-   components: new join code components (`JoinCodeDisplay`, `JoinCodeInput`, `StudentSelection`)
-   server actions: complete join flow with `lookupJoinCode`, `joinOrganization`, `joinClassAsStudent`, `joinClassAsTeacher`, `joinClassAsParent`
-   updated `org-card` and `class-card` to query and display join codes from the new entities
-   auth: on Google sign up, extract first name and last name from Google profile and store in `$users` table
-   auth: guest user upgrades correctly with magic code or Google auth now transfer first name, last name, and plan to the new authenticated user record
-   UX: moved class/org creation entirely to the client, including join codes which drastically speeds up optimistic updates
-   UX: moved sign up to be entirely client-side for faster optimistic updates

### 2025/12/31

-   upgraded React to 19.2
-   upgraded Next.js to 16
-   UX: organizations can be created, edited, and deleted
-   see the to-do above for more details
