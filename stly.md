# Daily classic game style

- Keep each game self-contained with plain HTML, CSS, and JavaScript.
- Use one shared stylesheet at `styles.css` for catalog, menus, controls, status bars, and board framing.
- Use the same top menu on the catalog and every game page: Catalog, Крестики-нолики, Змейка, Pong, Breakout, Сапер, Space Invaders, 15 Puzzle, Memory Match, Simon, Frogger, Hangman, Asteroids, Tetris, Whac-A-Mole, Lunar Lander, Connect Four, Centipede, Kaboom!, Pac-Man, Missile Command, Sokoban.
- Use one simple visual language for controls and status overlays: white background, dark border, 8px radius, inherited font, and compact spacing.
- Keep game pages optimized for one screen: compact header, horizontally scrollable shared menu, viewport-sized board, status, and hint visible together where possible.
- Keep the play area visible first; place controls and messages near the board without decorative wrappers.
- Do not add dependencies or broad styling systems for daily games.
- Pac-Man, Missile Command, and Sokoban use generated SVG assets while keeping the same compact board/status/button pattern as the other catalog games.
