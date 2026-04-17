# Daily classic game style

## Structure

- Keep each game self-contained with plain HTML, CSS, and JavaScript.
- Use one shared stylesheet at `styles.css` for catalog, menus, controls, status bars, and board framing.
- Do not add dependencies or broad styling systems for daily games.
- Keep links relative so the catalog can move between local preview, GitHub hosting, and a later `.ru` domain.

## Menu and Navigation

- Use the same compact top menu on the catalog and every game page: Catalog, Крестики-нолики, Змейка, Pong, Breakout, Сапер, Space Invaders, 15 Puzzle, Memory Match, Simon, Frogger, Hangman, Asteroids, Tetris, Whac-A-Mole, Lunar Lander, Connect Four, Centipede, Kaboom!, Pac-Man, Missile Command, Sokoban, Reversi, Qix Claim.
- The brand link always returns to `index.html`; game links use the shortest relative path for the current folder.
- Mark the current game with `aria-current="page"`.
- Keep the menu horizontally scrollable instead of wrapping into a tall block.

## Overlays and HUD

- Use one simple visual language for controls and status overlays: white background, dark border, 8px radius, inherited font, and compact spacing.
- Keep status text short: score, lives, moves, time, or one message.
- Avoid large modal overlays during normal play. The board should stay visible first.

## Controls

- Primary controls are keyboard and pointer/touch when the game supports it.
- Touch controls use `.button` styling and compact grids below the statusbar.
- Buttons keep an 8px or smaller radius, clear border contrast, and visible hover/focus state.
- Do not hide restart controls behind a menu.

## Typography

- Use the shared Arial stack from `styles.css`.
- Keep titles compact and hints concise.
- Do not use negative letter spacing or viewport-scaled font sizes.

## Color and Contrast

- Shared UI uses light surfaces, dark text, green accent, red danger, and gold reward colors.
- Game canvases may use richer scene colors, but controls and overlays should stay aligned with the shared palette.
- Ensure text remains readable over every background.

## One-Screen Layout

- Keep game pages optimized for one screen: compact header, horizontally scrollable shared menu, viewport-sized board, status, controls, and hint visible together where possible.
- Use `svh`-based board sizing and stable aspect ratios so desktop and mobile layouts do not jump.
- Keep the play area visible first; place controls and messages near the board without decorative wrappers.

## Assets

- Create real assets only when a game needs them; do not rely on placeholders.
- Store game-specific assets under that game's `assets` folder with clear names.
- Pac-Man, Missile Command, Sokoban, Reversi, and Qix Claim use generated SVG assets while keeping the same compact board/status/button pattern as the other catalog games.
