# Games folder style guide

The shared source of truth is `../stly.md`; this folder guide mirrors the required game-page rules so new entries can be implemented without opening unrelated pages.

## Menu style

- Use the compact `.topbar` from `../styles.css` with a white surface, dark border, 8px radius, and the shared shadow.
- Keep the brand link first and the game links inside the horizontally scrollable `.menu` row.
- Do not wrap the menu into a tall block; overflow should scroll horizontally.

## Navigation style

- The brand link always returns to the catalog `index.html` using the shortest relative path for the current folder.
- Every game page uses the same game-link order as the catalog: Крестики-нолики, Змейка, Pong, Breakout, Сапер, Space Invaders, 15 Puzzle, Memory Match, Simon, Frogger, Hangman, Asteroids, Tetris, Whac-A-Mole, Lunar Lander, Connect Four, Centipede, Kaboom!, Pac-Man, Missile Command, Sokoban, Reversi, Qix Claim, Lights Out.
- Mark only the current game link with `aria-current="page"`.
- Keep all URLs relative so local preview, repository hosting, and a later `.ru` domain use the same files.

## Overlay and HUD style

- Use `.statusbar` for score, moves, lives, timer, and short state messages.
- Keep HUD copy concise and in one row when space allows.
- Do not cover the active board with modal instructions during normal play.

## Control style

- Use `.button` for restart and touch controls.
- Controls must have clear borders, 8px or smaller radius, inherited font, and hover/focus feedback.
- Keep restart visible on the game page.

## Typography guidance

- Use the shared Arial stack from `../styles.css`.
- Keep titles compact, hints short, and letter spacing at zero.
- Do not scale font sizes directly with viewport width.

## Color and contrast guidance

- Shared UI uses light surfaces, dark text, green accent, red danger, and gold reward colors.
- Game art may use richer scene colors, but status bars, controls, menus, and links stay aligned with the shared palette.
- Text must remain readable over every background.

## Button and link behavior

- Links and buttons should visibly change on hover and focus.
- Current menu links use the same accent fill as existing games.
- Disabled or invalid game cells should not look clickable.

## Responsive one-screen layout

- Fit the menu, compact header, board, statusbar, and hint into one screen where possible.
- Use stable aspect ratios and `svh` sizing for boards.
- Keep the active play surface first; avoid decorative wrappers beyond the functional board frame.

## Assets

- Store game-specific assets under `games/<game>/assets` with clear names.
- Use finished SVG or canvas art, not placeholders.
- Keep asset references relative through `../styles.css` patterns already used by the catalog.
