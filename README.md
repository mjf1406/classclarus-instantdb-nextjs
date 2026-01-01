<!-- @format -->

# ClassClarus

## To-do List

-   [ ] organizations
    -   [x] create organization
    -   [x] edit organization
    -   [x] delete organization
    -   [x] list organizations
    -   `/` page
        -   [ ] the home page shows all orgs the user is in as collapsible sections, which show all the classes the user is in for each org,
        -   [x] each org section has ability to create, edit, delete the org if admin
        -   [ ] each class uses the class card, which allows the user to create, edit, delete classes in each org
    -   [ ] `/[orgId]` page shows all classes in the org, with ability to create, edit, delete classes in that org
-   [ ] classes
    -   [ ] create class
    -   [ ] edit class
    -   [ ] delete class
    -   [ ] list classes
-   guests
    -   [ ] guest description
    -   [ ] guest limitations section
    -   [ ] guest upgrade card
    -   [ ] CRON job: once per day at midnight, delete all guest accounts that are older than 14 days
-   [ ] authentication
    -   [ ] magic code auth added
    -   [ ] Google auth added
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
