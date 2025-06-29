# LumaBoard

A self-contained, client-side digital signage and dashboard system that runs entirely in the browser. Configure scenes, widgets, and layouts using JSON. No server required.

## Features
- Scene rotation and scheduling
- Dynamic widgets: clock, weather, news, stocks, YouTube, images, video, notes, and more
- Offline fallback and data caching
- Visual dimming, anti-burn-in, and sleep scheduling
- Debug overlay and developer tools

## Getting Started
1. Clone the repo
2. Run a local dev server (e.g., Vite, http-server)
3. Edit `config/example-config.json` to customize scenes and widgets
4. Open `index.html` in your browser

## Security

LumaBoard implements comprehensive security measures for production deployment:

### Content Security Policy (CSP)
The application uses strict CSP headers to prevent XSS attacks and unauthorized content loading. The CSP policy includes:

- **default-src 'self'**: Only allow resources from the same origin
- **script-src 'self' 'unsafe-inline'**: Allow inline scripts for dynamic content
- **style-src 'self' 'unsafe-inline' fonts.googleapis.com**: Allow styles and Google Fonts
- **img-src 'self' data: https: blob**: Allow images from secure sources
- **frame-src 'self' https://www.youtube.com**: Allow YouTube embeds
- **connect-src 'self' https: wss**: Allow secure network connections

### Deployment Security Headers
For production deployment, ensure your hosting platform supports the security headers defined in `public/_headers`:

**Netlify/Vercel**: Headers are automatically applied from `public/_headers`
**Apache**: Copy directives to `.htaccess`
**Nginx**: Add headers to server configuration
**Cloudflare**: Configure security headers in dashboard

### Input Sanitization
All user inputs are automatically sanitized using the built-in sanitization engine:
- HTML content is filtered through allowlist-based sanitization
- CSS properties are validated against security policies
- URLs are validated for protocol and domain restrictions
- Configuration data is validated against schemas

### Browser Compatibility
- Modern browsers with CSP Level 2 support
- Shadow DOM support for widget isolation
- ES2022 features (optional chaining, nullish coalescing)

## Tech Stack
- HTML5, CSS3, ES2022 JavaScript
- Web Components with Shadow DOM isolation
- Content Security Policy (CSP) Level 2
- Optional: Vite for development

## License
MIT 