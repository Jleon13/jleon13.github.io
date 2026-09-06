# Personal site

Plain HTML/CSS site, no build step needed — GitHub Pages serves it as-is.

## Structure

- `index.html` — home page (about, education, projects, contact)
- `blog/index.html` — list of all posts
- `blog/*.html` — individual posts
- `css/style.css` — shared styles
- `images/` — photos

## Editing content

Open `index.html` and replace the placeholder text (marked with `TODO` comments):
your name, bio, education/experience entries, projects, email, and social links.

## Adding a new blog post

1. Duplicate `blog/hello-world.html`, rename it (e.g. `blog/my-new-post.html`).
2. Edit its title, date, and body text.
3. Add a link to it in `blog/index.html` (copy a `.post-list-item` block).
4. Optionally also link it from the "Latest Writing" section in `index.html`.

## Publishing changes

```
git add -A
git commit -m "Update site"
git push
```

GitHub Pages rebuilds automatically after each push (usually live within a minute).
