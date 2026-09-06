# Personal site

Plain HTML/CSS site, no build step needed — GitHub Pages serves it as-is.

## Structure

- `index.html` — home page (about, education, projects, contact)
- `blog/index.html` — list of all posts (42, generated from existing writings)
- `blog/posts/*.html` — individual posts
- `css/style.css` — shared styles
- `images/` — photos

## Editing content

Open `index.html` and replace the placeholder text (marked with `TODO` comments):
bio and projects still need filling in.

## Adding a new blog post

1. Duplicate any file in `blog/posts/`, rename it (e.g. `blog/posts/my-new-post.html`).
2. Edit its title, date, category, and body text.
3. Add a link to it in `blog/index.html` (copy a `.post-list-item` block).
4. Optionally also link it from the "Latest Writing" section in `index.html`.

## Publishing changes

```
git add -A
git commit -m "Update site"
git push
```

GitHub Pages rebuilds automatically after each push (usually live within a minute).
