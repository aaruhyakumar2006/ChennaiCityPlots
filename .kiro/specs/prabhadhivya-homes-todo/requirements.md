# Requirements Document

## Introduction

This spec covers the outstanding feature completion work for the **Prabhadhivya Homes** real estate platform — a Vite + React 18 + TypeScript + Tailwind CSS + Supabase SPA. The codebase already has a working admin dashboard, property listings, leads management, and site-visit scheduling. The following areas are either stubbed, incomplete, or contain dead code that must be resolved to reach production readiness.

---

## Glossary

- **Platform**: The Prabhadhivya Homes Vite/React SPA (`src/App.tsx` entry point).
- **Admin**: An authenticated administrator user with a valid Supabase session (admin JWT).
- **Public_User**: An unauthenticated or Supabase Auth–authenticated end-user browsing the public site.
- **Supabase**: The PostgreSQL + Auth backend accessed via the `@supabase/supabase-js` client.
- **Cloudinary**: The third-party media CDN used for image and video uploads.
- **Resend**: The transactional email API used to deliver lead notification emails.
- **Leaflet**: The open-source map library already installed in the project (`npm package: leaflet`).
- **PropertyFormModal**: The admin component at `src/components/admin/PropertyFormModal.tsx` used to create and edit properties.
- **AuthGateModal**: The component at `src/components/AuthGateModal.tsx` that gates Supabase Auth sign-up/sign-in for public users.
- **Wishlist**: The client-side saved-properties feature backed by `useWishlist` hook.
- **Lead**: A prospect enquiry record in the Supabase `leads` table.
- **Property_Review**: A star-rated user comment record in the Supabase `property_reviews` table.
- **Testimonial**: A curated customer quote record in the Supabase `testimonials` table.
- **Builder**: A developer/builder entity record in the Supabase `builders` table.
- **SEO_Helmet**: The `react-helmet-async` (or equivalent) component that injects per-page `<title>` and `<meta>` tags into the document `<head>`.
- **Sitemap_Script**: The Node.js script at `scripts/generate-sitemap.mjs` that outputs `public/sitemap.xml`.
- **Next.js_Tree**: The unused Next.js App Router source tree located under `src/app/`.

---

## Requirements

---

### Requirement 1: Media Upload — Images and Documents

**User Story:** As an Admin, I want to upload property photos, floor-plan images, and PDF documents directly from the admin property form, so that rich media is stored in Cloudinary and linked to the property record in Supabase without manual URL entry.

#### Acceptance Criteria

1. WHEN an Admin selects one or more image files (JPEG, PNG, WebP, GIF, max 10 MB each) in the PropertyFormModal upload panel, THE PropertyFormModal SHALL upload each file to Cloudinary using the `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` environment variables and store the returned `secure_url` in the `property_images` table with the `image_type` set to `"photo"`.
2. WHEN an image upload is in progress, THE PropertyFormModal SHALL display a per-file loading indicator and disable the form submit button until all uploads resolve (success or error).
3. IF a Cloudinary upload request returns a non-2xx HTTP status or a network error, THEN THE PropertyFormModal SHALL display an inline error message that names the failed file and SHALL NOT insert or update any `property_images` rows for that batch in Supabase.
4. WHEN an Admin selects a PDF file (max 20 MB) in the document upload panel, THE PropertyFormModal SHALL upload the file to Cloudinary and store the returned `secure_url` along with the original file name in the `documents` table linked to the property, with `type` set to `"brochure"` by default.
5. WHEN an Admin reorders existing images by drag-and-drop in edit mode, THE PropertyFormModal SHALL persist the updated `sort_order` integer values to the `property_images` table as part of the save operation.
6. WHEN an Admin clicks the delete icon on an existing image thumbnail in edit mode, THE PropertyFormModal SHALL mark that image for removal and, on save, delete the corresponding `property_images` row from Supabase.
7. WHEN an Admin enters a YouTube video URL in the video URL input field, THE PropertyFormModal SHALL validate that the URL matches the pattern `https://www.youtube.com/watch?v=` or `https://youtu.be/` and store the URL and a title in the `property_videos` table linked to the property on save.
8. WHEN a property is saved (create or edit) and `VITE_CLOUDINARY_CLOUD_NAME` is absent or empty, THEN THE PropertyFormModal SHALL display a prominent configuration error message reading "Cloudinary is not configured — contact your administrator" and SHALL NOT call the Cloudinary upload API.

---

### Requirement 2: Admin Property Create / Edit Forms

**User Story:** As an Admin, I want fully functional create and edit property forms in the admin dashboard, so that I can add new listings and update existing ones without using raw database access.

#### Acceptance Criteria

1. WHEN an Admin clicks "Create Property" in AdminPropertiesPage, THE Platform SHALL open PropertyFormModal in create mode with all text and numeric fields empty, select fields defaulting to their first option (type: RESIDENTIAL, status: UNDER_CONSTRUCTION), and an auto-generated `property_id` pre-filled in the read-only ID field.
2. WHEN an Admin submits a valid create form, THE PropertyFormModal SHALL insert a new row into the Supabase `properties` table and call `onSaved` with the returned row; the modal SHALL then close automatically.
3. WHEN an Admin clicks the edit action on an existing property row, THE Platform SHALL open PropertyFormModal in edit mode pre-populated with all current field values including builder, images, nearby places, and SEO fields.
4. WHEN an Admin submits a valid edit form, THE PropertyFormModal SHALL update the existing `properties` row in Supabase via an `update` call (not upsert) and call `onSaved` with the updated row; the modal SHALL then close automatically.
5. IF the submitted property name is empty, the location is empty, the description is empty, the price is not a whole number ≥ 1, or the slug is empty, THEN THE PropertyFormModal SHALL display inline field-level validation error messages next to the offending fields and SHALL NOT call any Supabase insert or update.
6. IF a Supabase operation returns a unique-constraint violation error on the `slug` column, THEN THE PropertyFormModal SHALL display an inline error on the slug field reading "This slug is already taken — please choose a different one" and SHALL keep the modal open with all data intact.
7. IF a Supabase operation returns any non-slug error, THEN THE PropertyFormModal SHALL display a toast or banner error message with the Supabase error message text and SHALL keep the modal open with all data intact.
8. WHEN an Admin adds or removes entries in the Nearby Places section of the form, THE PropertyFormModal SHALL insert new rows, update changed rows, or delete removed rows in the `nearby_places` table during the save operation; nearby place entries with a blank name SHALL be silently skipped.
9. WHEN the property name field changes during create mode, THE PropertyFormModal SHALL auto-derive the slug in real time by converting the name to lowercase, replacing spaces with hyphens, and removing non-alphanumeric characters; auto-derivation SHALL stop permanently once the Admin directly edits the slug field for the remainder of that create session.

---

### Requirement 3: Email Notifications on New Leads

**User Story:** As an Admin, I want to receive an email alert whenever a new enquiry lead is submitted through the public site, and the enquirer should receive a confirmation email, so that no lead is missed and enquirers feel acknowledged promptly.

#### Acceptance Criteria

1. WHEN a Public_User submits the enquiry form and the lead is successfully saved to Supabase, THE Platform SHALL call the Resend API using the `RESEND_API_KEY` environment variable to send an admin notification email to the address in `ADMIN_EMAIL`.
2. THE admin notification email SHALL include the lead's name, mobile number, email address, the linked property name (if any), and an absolute URL linking directly to the admin leads panel (e.g. `https://{VITE_SITE_URL}/admin/leads`).
3. WHEN a new lead is successfully saved, THE Platform SHALL send a confirmation email to the lead's email address that acknowledges receipt of their enquiry and states that the team will respond within 24 hours.
4. IF the `RESEND_API_KEY` environment variable is absent or empty, OR if the `ADMIN_EMAIL` environment variable is absent or empty, THEN THE Platform SHALL skip email sending silently and SHALL NOT throw an error or prevent the lead from being saved.
5. IF the Resend API returns an error for the admin notification, THEN THE Platform SHALL write a server-side log entry recording the error and SHALL dispatch the lead creation response to the user without delay; the email failure SHALL NOT block or delay the response.
6. IF the Resend API returns an error for the confirmation email, THEN THE Platform SHALL write a server-side log entry recording the error and SHALL NOT block or delay the lead creation response to the user.
7. THE Platform SHALL implement email sending as a Supabase Edge Function triggered by a database webhook on the `leads` table insert event, so that email logic runs server-side and the `RESEND_API_KEY` is never exposed to the browser.

---

### Requirement 4: Interactive Property Map (Leaflet)

**User Story:** As a Public_User, I want to see an interactive map on the property detail page showing the property location and nearby places of interest, so that I can understand the property's surroundings without leaving the site.

#### Acceptance Criteria

1. WHEN a Public_User views a property detail page that has valid `latitude` and `longitude` values, THE Platform SHALL render PropertyMap (using Leaflet) centred on those coordinates at zoom level 14.
2. WHEN a property has no `latitude` or `longitude`, THE Platform SHALL render PropertyMap centred on the Chennai city-centre fallback coordinate (13.0827° N, 80.2707° E) at zoom level 12.
3. WHEN PropertyMap is rendered, THE Platform SHALL display a primary marker at the property's centre coordinate and SHALL display a separate colour-coded marker for each of the first 5 `nearby_places` entries linked to that property, using fixed coordinate offsets from the property centre when individual place coordinates are not available.
4. WHEN a Public_User clicks a nearby-place marker, THE Platform SHALL display a Leaflet popup showing the place name and category.
5. THE PropertyMap component SHALL be used on the property detail page in place of MockMap; MockMap SHALL remain in the codebase but SHALL NOT be rendered on any live page.
6. WHEN the Leaflet map container is initialised, THE Platform SHALL apply the Leaflet default-icon fix (delete `L.Icon.Default.prototype._getIconUrl` and call `L.Icon.Default.mergeOptions` with the correct asset paths) so that marker icons render correctly under the Next.js bundler.
7. WHILE the property detail page data is loading, THE Platform SHALL render a grey placeholder `<div>` of dimensions `h-[360px] md:h-[440px]` in the map position to prevent layout shift.

---

### Requirement 5: SEO — Per-Property Meta Tags

**User Story:** As a site owner, I want each property detail page to have accurate `<title>` and `<meta description>` tags derived from the property's SEO fields, so that search engines index the pages correctly and social sharing previews display relevant content.

#### Acceptance Criteria

1. WHEN a Public_User navigates to a property detail page, THE SEO_Helmet SHALL set the document `<title>` to the property's `seo_title` if non-null and non-empty, or fall back to the property `name` concatenated with " — Prabhadhivya Homes".
2. WHEN a Public_User navigates to a property detail page, THE SEO_Helmet SHALL set the `<meta name="description">` content to the property's `seo_description` if non-null and non-empty, or fall back to the first 155 characters of the property's `description` field; if `description` is also null or empty, THE SEO_Helmet SHALL omit the meta description tag entirely.
3. WHEN a Public_User navigates to a property detail page, THE SEO_Helmet SHALL set `<meta name="keywords">` to the property's `seo_keywords` if the field is non-null and non-empty; otherwise THE SEO_Helmet SHALL omit the keywords tag.
4. WHEN a Public_User navigates to a property detail page, THE SEO_Helmet SHALL set a `<link rel="canonical">` tag with `href` equal to `{NEXT_PUBLIC_SITE_URL}/properties/{slug}`, where `NEXT_PUBLIC_SITE_URL` is read from the environment variable of that name.
5. WHEN a Public_User navigates to a property detail page, THE SEO_Helmet SHALL set `og:title` to the resolved title (same logic as criterion 1), `og:description` to the resolved description (same logic as criterion 2), `og:url` to the canonical URL (same logic as criterion 4), `og:type` to `"website"`, and `og:image` to the `url` of the first `property_images` row for that property; IF no image exists, THEN THE SEO_Helmet SHALL omit the `og:image` tag.
6. WHEN a Public_User navigates to the Home page, THE SEO_Helmet SHALL set `<title>` to "Prabhadhivya Homes — Premium Real Estate in Chennai" and `<meta name="description">` to "Find your dream home in Chennai with Prabhadhivya Homes. Browse premium residential and commercial properties."; WHEN a Public_User navigates to the Properties listing page, THE SEO_Helmet SHALL set `<title>` to "Properties — Prabhadhivya Homes" and `<meta name="description">` to "Explore our curated listings of residential and commercial properties across Chennai.".

---

### Requirement 6: SEO — Sitemap and Robots

**User Story:** As a site owner, I want an up-to-date `sitemap.xml` and a `robots.txt` to be served, so that search engine crawlers can discover and index all public pages efficiently.

#### Acceptance Criteria

1. THE Sitemap_Script SHALL generate a well-formed XML sitemap conforming to the Sitemap protocol schema (xmlns `http://www.sitemaps.org/schemas/sitemap/0.9`) at `public/sitemap.xml` containing `<url>` entries for: the home page (`/`), the properties listing (`/properties`), the compare page (`/compare`), the saved page (`/saved`), all individual property detail pages (`/properties/{slug}`), and all distinct locality pages (`/properties/location/{area}`).
2. WHEN the Sitemap_Script runs, THE Sitemap_Script SHALL read property `slug`, `location`, and `updated_at` values from the Supabase `properties` table using the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables.
3. THE Sitemap_Script SHALL set `<lastmod>` on each property URL entry to the property's `updated_at` date formatted as `YYYY-MM-DD` (ISO 8601 date without time component).
4. THE `public/robots.txt` file SHALL contain a `Sitemap:` directive pointing to `{VITE_SITE_URL}/sitemap.xml`, where `VITE_SITE_URL` is the production domain configured in the `.env` file.
5. THE Sitemap_Script SHALL be runnable via `npm run sitemap` as defined in `package.json` and SHALL complete without user interaction.
6. IF the `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY` environment variables are absent or empty, OR if the Supabase API returns a non-2xx response, OR if a network connection cannot be established, THEN THE Sitemap_Script SHALL print an error message to stderr indicating the cause, exit with a non-zero exit code, and SHALL NOT write a partial `sitemap.xml`.

---

### Requirement 7: Remove Unused Next.js Source Tree

**User Story:** As a developer, I want the unused Next.js App Router code under `src/app/` to be deleted, so that the repository is clean, build times are unaffected by dead code, and new contributors are not confused about which framework drives the application.

#### Acceptance Criteria

1. THE Platform SHALL delete the entire `src/app/` directory and all its subdirectories after verifying that no file within `src/` (outside `src/app/`) contains an import statement or path alias resolving to a file inside `src/app/`.
2. THE Platform SHALL delete `next.config.mjs` and `next-env.d.ts` from the project root; `next` and `@types/next` are not present in `package.json` and require no action.
3. THE Platform SHALL also delete or refactor `src/middleware.ts`, which imports `NextRequest` and `NextResponse` from `"next/server"`, before or during the removal; the Vite SPA has no server-side middleware runtime, so this file has no effect and its deletion shall not break the build.
4. WHEN the Vite build is run (`npm run build`) after all deletions, THE build SHALL complete successfully with zero TypeScript errors and zero module-not-found errors attributable to the removed files.
5. THE Platform SHALL retain `public/robots.txt`, `public/placeholder-property.png`, and all files under `src/lib/`, `src/pages/`, `src/components/`, `src/layouts/`, and `src/types/`; only Next.js–specific files (`src/app/`, `next.config.mjs`, `next-env.d.ts`, `src/middleware.ts`) SHALL be removed.

---

### Requirement 8: Supabase Auth Gate — Wishlist, Reviews, Enquiry

**User Story:** As a Public_User, I want to be prompted to sign in or create an account when I try to save a property to my wishlist or submit a property review, so that these actions are associated with my account and my preferences persist across sessions.

#### Acceptance Criteria

1. WHEN an unauthenticated Public_User clicks any save/heart icon (on PropertyCard, PropertyListItem, or the property detail page), THE Platform SHALL call `openGate("Sign in to save properties to your wishlist")` to open AuthGateModal and SHALL NOT modify the wishlist.
2. WHEN an authenticated Public_User clicks the save/heart icon on any surface, THE Platform SHALL immediately toggle the property in/out of the Wishlist and SHALL NOT open AuthGateModal.
3. WHEN an unauthenticated Public_User clicks the submit button on the PropertyReviews review form, THE Platform SHALL call `openGate("Sign in to write a review")` to open AuthGateModal and SHALL NOT call the Supabase insert.
4. WHEN an authenticated Public_User opens the PropertyReviews form, THE Platform SHALL pre-fill the reviewer name field with the value of `user.user_metadata.full_name` from the Supabase Auth session; if `full_name` is absent, the name field SHALL be left empty.
5. WHEN a Public_User successfully authenticates through AuthGateModal and the pending action was a wishlist save, THE Platform SHALL execute the wishlist toggle for the property that triggered the gate; WHEN the pending action was a review submit, THE Platform SHALL submit the review form with the data the user had already entered, without requiring the user to re-enter anything.
6. THE enquiry/lead submission form on the property detail page SHALL remain fully functional for unauthenticated users; AuthGateModal SHALL NOT be triggered by lead form submission.
7. WHEN an authenticated Public_User views the `/saved` page, THE Platform SHALL load the wishlist from a Supabase-persisted source so that the same saved properties are visible across different browsers and devices for the same account.
8. WHEN an unauthenticated Public_User signs in through AuthGateModal and had locally saved properties in the localStorage wishlist before signing in, THE Platform SHALL merge those localStorage entries into the authenticated user's Supabase-persisted wishlist before clearing the localStorage copy.

---

### Requirement 9: Builders Module — Data Wiring

**User Story:** As an Admin, I want full CRUD operations for builders in AdminBuildersPage, and as a Public_User, I want BuilderProfilePage to display only properties linked to the specific builder, so that each builder's portfolio is accurately represented.

#### Acceptance Criteria

1. WHEN the AdminBuildersPage component mounts, THE Platform SHALL fetch all rows from the Supabase `builders` table ordered by `name` ascending and display them in the existing table layout; IF the Supabase query returns an error, THEN THE Platform SHALL display a user-facing error message in the table area.
2. WHEN an Admin submits the BuilderModal create form with a non-empty name and a unique `slug`, THE Platform SHALL insert a new row into the `builders` table, prepend the returned row to the local builders list without a full page reload, and close the modal; IF the insert returns a unique-constraint violation on `slug`, THEN THE Platform SHALL display an inline error on the slug field and keep the modal open.
3. WHEN an Admin submits the BuilderModal edit form, THE Platform SHALL update the existing `builders` row in Supabase, replace the corresponding row in the local list with the returned updated row without a full page reload, and close the modal; IF the update returns an error, THEN THE Platform SHALL display the error message in the modal and keep the modal open.
4. WHEN an Admin confirms deletion of a builder, THE Platform SHALL delete the row from the `builders` table; IF the delete succeeds, THE Platform SHALL remove the builder from the local list; properties previously linked to the deleted builder will have their `builder_id` set to null by the Supabase `ON DELETE SET NULL` foreign key constraint.
5. WHEN a Public_User navigates to `/builders/:slug`, THE BuilderProfilePage SHALL query the Supabase `builders` table for the row where `slug` equals the URL parameter and display the builder's name, logo (or initial fallback), description, `established_year`, `total_projects`, `delivered_projects`, phone, email, and website.
6. WHEN the BuilderProfilePage renders a builder, THE Platform SHALL query the `properties` table with a filter `builder_id = {builder.id}` and display only those properties as PropertyCard components, ordered by `created_at` descending.
7. IF the Supabase query for the builder returns no matching row or returns an error, THEN THE BuilderProfilePage SHALL call `navigate("/not-found", { replace: true })`.

---

### Requirement 10: Testimonials Admin — Full CRUD

**User Story:** As an Admin, I want to create, read, toggle publish status, and delete testimonials in AdminTestimonialsPage, so that the homepage testimonials section always shows curated, accurate customer quotes.

#### Acceptance Criteria

1. WHEN the AdminTestimonialsPage component mounts, THE Platform SHALL fetch all rows from the Supabase `testimonials` table ordered by `created_at` descending and display them; IF the fetch returns an error, THEN THE Platform SHALL display a user-facing error banner indicating the fetch failed.
2. WHEN an Admin submits the add-testimonial form with a non-empty name (max 100 characters), a non-empty role (max 150 characters), a non-empty quote (max 1000 characters), and a rating between 1 and 5, THE Platform SHALL insert a new row into the `testimonials` table with `published = true` and display it at the top of the local list without a full page reload.
3. IF the name, role, or quote field is empty, or the name exceeds 100 characters, or the role exceeds 150 characters, or the quote exceeds 1000 characters, THEN THE AdminTestimonialsPage SHALL display an inline validation error next to the offending field and SHALL NOT call Supabase insert.
4. WHEN an Admin toggles the published/hidden switch for a testimonial, THE Platform SHALL immediately update the UI to reflect the new `published` state (optimistic update), then call Supabase to update the `published` column; IF the Supabase update returns an error, THEN THE Platform SHALL revert the toggle to its previous state and display a user-facing error message indicating the failure reason.
5. WHEN an Admin confirms deletion of a testimonial via a confirmation dialog, THE Platform SHALL delete the corresponding row from the `testimonials` table and remove it from the local list without a full page reload; IF the delete returns an error, THEN THE Platform SHALL display a user-facing error message and restore the row to the list in its pre-deletion position.
6. THE public HomePage testimonials section SHALL query the `testimonials` table with a filter `published = eq.true` so that unpublished testimonials are never returned and therefore never visible to Public_Users.
7. IF a Supabase insert or delete in AdminTestimonialsPage returns an error, THEN THE Platform SHALL display a user-facing error message indicating the failure reason, and the local testimonials list SHALL revert to its exact state before the failed operation.

---

### Requirement 11: Property Reviews — Supabase Wiring

**User Story:** As a Public_User, I want to read existing property reviews and submit my own star-rated review on the property detail page, so that I can make informed decisions based on community feedback.

#### Acceptance Criteria

1. WHEN a Public_User loads a property detail page, THE PropertyReviews component SHALL fetch all rows from the `property_reviews` table where `property_id` matches, ordered by `created_at` descending, and display them; IF the Supabase fetch returns an error, THEN THE PropertyReviews component SHALL display an inline error message and render no review cards.
2. WHEN a Public_User submits the review form with a non-empty name (max 80 characters) and a non-empty comment (max 500 characters), THE PropertyReviews component SHALL insert a new row into the `property_reviews` table with the provided `name`, `rating` (integer 1–5), `comment`, and `property_id`.
3. IF the name field is empty or the comment field is empty, THEN THE PropertyReviews component SHALL display an inline validation error beneath the offending field and SHALL NOT call Supabase insert.
4. WHEN a review is successfully inserted, THE PropertyReviews component SHALL prepend the new review to the top of the displayed list, reset the rating selector to 5, clear the name and comment fields to empty strings, and remove any previous error messages.
5. WHEN the PropertyReviews component renders with one or more reviews, THE Platform SHALL compute the average `rating` across all fetched reviews (rounded to one decimal place) and display it alongside the total review count; the average SHALL update immediately after each successful new submission without a page reload.
6. IF the Supabase insert returns an error, THEN THE PropertyReviews component SHALL display a user-facing error message above the form and SHALL NOT add any entry to the displayed review list.
7. WHEN there are no reviews for a property (the fetched list is empty), THE PropertyReviews component SHALL display a placeholder message reading "No reviews yet — be the first to review this property."
