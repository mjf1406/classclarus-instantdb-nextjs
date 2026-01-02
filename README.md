<!-- @format -->

# ClassClarus

## To-do List

-   [ ] fetch orgs the user is owner, admin, or member of
-   [ ] fetch classes within the given org the user is owner, admin, or teacher of
-   [ ] organizations
    -   [x] create organization
    -   [x] edit organization
    -   [x] delete organization
    -   [x] list organizations
    -   `/` page
        -   [x] the home page shows all orgs the user is in as collapsible sections, which show all the classes the user is in for each org,
        -   [x] each org section has ability to create, edit, delete the org if admin
    -   [x] `/[orgId]` page shows all classes in the org, with ability to create, edit, delete classes in that org
    -   [ ] edit complex fields for org
        -   [ ] manage admins
        -   [ ] manage parents
        -   [ ] manage students
-   [ ] classes
    -   [x] create class
    -   [x] edit basic fields for class
    -   [ ] edit complex fields for class
        -   [ ] manage admins
        -   [ ] manage students
        -   [ ] manage teachers
    -   [x] delete class
    -   [x] list classes
-   guests
    -   [x] guest description
    -   [x] guest limitations section
    -   [x] guest upgrade card
    -   [ ] CRON job: once per day at midnight, delete all guest accounts that are older than 14 days
-   [ ] authentication
    -   [x] magic code auth added
        -   [ ] sets plan to free on signup
    -   [x] Google auth added
        -   [ ] Google Auth extracts first name, last name from Google nonce and adds it to the $users table
        -   [ ] sets plan to free on signup
    -   [ ] Guest to magic code upgrade flow added
    -   [ ] Guest to Google upgrade flow added
-   [ ] rate limiting in `proxy.ts`
    -   [ ] limit to 5 requests per 10 seconds per IP address
    -   [ ] limit to 60 requests per 1 minute per free authenticated user

## Change Log

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
