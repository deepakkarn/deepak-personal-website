# Publishing a blog post

This folder holds individual HTML articles.

1. Copy `posts/_template.html` to `posts/your-article-slug.html` and replace the placeholder title, date and article body.
2. Remove the `<meta name="robots" content="noindex">` line from your published article.
3. Add the article to `posts.js` by adding an object to `window.DK_BLOG_POSTS` (see its example). Use the relative URL `posts/your-article-slug.html` and Nepali/English titles, excerpts and categories.
4. Commit your changes. Cloudflare's Git integration will deploy the new article automatically if connected to the `main` branch.

The index page uses the same preferred language as the homepage. Individual articles can be in Nepali or English; set the article HTML's `lang` attribute accordingly.

**Note:** This is a simple static blog, not an in-browser editor or CMS. Write posts by updating files in GitHub, or ask ChatGPT to create and publish them through the connected GitHub repository.
