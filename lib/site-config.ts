/**
 * Site-wide configuration flags.
 *
 * MAINTENANCE MODE
 * Set `isDown = true`  -> shows maintenance page (no navbar/footer, no API calls)
 * Set `isDown = false` -> live site resumes normally
 */
export const isDown = false;

/**
 * Canonical public origin used for SEO (canonical tags, sitemap, robots,
 * structured data). Must be the domain the site is actually served on —
 * evo-techbd.com redirects to www, so canonicals must point at www.
 */
export const siteURL = "https://www.evo-techbd.com";
