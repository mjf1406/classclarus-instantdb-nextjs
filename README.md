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
        -   [ ] manage members
        -   [ ] manage admins
-   [ ] classes
    -   [x] create class
    -   [x] edit basic fields for class
    -   [ ] edit complex fields for class
        -   [ ] manage students
        -   [ ] manage teachers
        -   [ ] manage admins
    -   [x] delete class
    -   [x] list classes
-   guests
    -   [x] guest description
    -   [x] guest limitations section
    -   [ ] guest upgrade card
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

### 2025/12/31

-   upgraded React to 19.2
-   upgraded Next.js to 16
-   UX: organizations can be created, edited, and deleted
-   see the to-do above for more details
