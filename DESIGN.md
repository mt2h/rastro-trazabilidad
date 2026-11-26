---
name: RASTRO traceability page
description: A wake of purple, fuchsia and yellow light on a warm blush haze, with coffee-brown ink, footprints and beans. The route is the light.
colors:
  espresso: "#2b1710"
  roast-soft: "#5e4a3f"
  blush: "#fdf4fa"
  blush-deep: "#f6e0f0"
  white: "#ffffff"
  brand-fuchsia: "#e7037f"
  hot-fuchsia: "#ff2fa0"
  fuchsia-fill: "#d1006f"
  accent-fuchsia: "#b0066a"
  violet: "#8b5cf6"
  purple-fill: "#6d28d9"
  sun-yellow: "#ffd60a"
  amber: "#ffc400"
  amber-fill: "#b45309"
  amber-ink: "#8a4b00"
  coffee: "#6b4226"
typography:
  display:
    fontFamily: "Sora, Arial Narrow, Arial, sans-serif"
    fontSize: "5.9rem"
    fontWeight: 200
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  display-compact:
    fontFamily: "Sora, Arial Narrow, Arial, sans-serif"
    fontSize: "2.8rem"
    fontWeight: 200
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Sora, Arial Narrow, Arial, sans-serif"
    fontSize: "4rem"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  headline-compact:
    fontFamily: "Sora, Arial Narrow, Arial, sans-serif"
    fontSize: "2.2rem"
    fontWeight: 300
    lineHeight: 1.04
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Sora, Arial Narrow, Arial, sans-serif"
    fontSize: "1.4rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.45rem"
    fontWeight: 400
    lineHeight: 1.5
  lede:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.6
  subhead:
    fontFamily: "Sora, Arial Narrow, Arial, sans-serif"
    fontSize: "2.1rem"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  caption:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Hanken Grotesk, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  card: "16px"
  lg: "20px"
  panel: "24px"
  hero: "36px"
  pill: "999px"
  knot: "50%"
spacing:
  gutter: "clamp(1.25rem, 5vw, 4rem)"
  section: "clamp(4.5rem, 9vw, 8rem)"
components:
  button-primary:
    backgroundColor: "{colors.espresso}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 2.1rem"
    height: "3.75rem"
  button-glass:
    backgroundColor: "{colors.white}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.pill}"
    padding: "0.9rem 2.1rem"
    height: "3.75rem"
  glass-panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.panel}"
    padding: "2rem"
  knot:
    backgroundColor: "{colors.white}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.knot}"
    size: "48px"
  knot-current:
    backgroundColor: "{colors.sun-yellow}"
    textColor: "{colors.espresso}"
    rounded: "{rounded.knot}"
    size: "48px"
---

# Design System: RASTRO traceability page

## Overview

**Creative North Star: "The Wake of Light"**

The route of a coffee is a wake of living light. Purple, fuchsia and yellow glow on a warm blush haze, and the coffee itself leaves its mark in brown: the ink, the footprints and the beans that fall along the way. The fuchsia is the brand's own. The logo is a coffee bean on a fuchsia-to-purple disc, its crease leading into a dotted trail that ends in a yellow stop; the disc behind the bag is covered in tone-on-tone beans.

It is bright, glossy and a little futuristic on purpose. It rejects the dark premium coffee template, the cream artisan template, the Andean stripe cloth that came before it, and anything that looks like the 1990s.

**Key Characteristics:**
- A pale blush ground, so the color is light and not paint: three soft fields of purple, fuchsia and yellow drift behind everything.
- Frosted glass panels with a hairline luminous rim and layered soft shadows.
- Thin, large display type with one heavy phrase, and big buttons.
- Buttons, tabs, menu links and headline letters glow as the pointer gets close.
- The menu is a compact dark capsule: logo and wordmark, a pill with the two section links and a sliding marker that follows the section being read, and a fuchsia "Comprar" button. A thin line under it fills as you read. Links to sections glide with an eased curve (0.7 to 1.5 s) and stop at the first wheel, touch or key.
- Coffee brown is the only ink: text, footprints, beans.

## Colors

### Primary
- **Brand Fuchsia** (`#e7037f`) and **Hot Fuchsia** (`#ff2fa0`): the logo's color and its light. Lot 3's wake.
- **Violet** (`#8b5cf6`) and **Purple Fill** (`#6d28d9`): the second light. Lot 3.1's wake; the fill carries white text.
- **Sun Yellow** (`#ffd60a`) and **Amber** (`#ffc400`): the lit stop, the sparkles and Lot 3.5's wake.

### Neutral
- **Espresso** (`#2b1710`): all text and the primary button.
- **Roast Soft** (`#5e4a3f`): secondary text.
- **Blush** (`#fdf4fa`) and **Blush Deep** (`#f6e0f0`): the ground and the map's ground.
- **Coffee** (`#6b4226`): footprints and beans only.

### Named Rules
**The One Lit Stop Rule.** Sun yellow glows on exactly one thing: the current stop on the map and in the timeline.

**The Four Colors Rule.** Every lot's wake mixes the four colors of the page (fuchsia, purple, yellow, brown). Lot 3 is fuchsia to violet, Lot 3.1 is violet to fuchsia, Lot 3.5 is amber to fuchsia.

**The Coffee Ink Rule.** Brown marks only coffee things: text, footprints, beans. It never becomes a background.

## Typography

**Display Font:** Sora (200 to 800), self-hosted.
**Body Font:** Hanken Grotesk, self-hosted.

**Character:** Very light, wide display letters for the headline with one phrase in 700, over a warm humanist sans for reading. Sizes are large on purpose: body 1.125rem, lede 1.25rem, buttons 1.15rem.

### Hierarchy
- **Display** (200 with a 700 phrase, 2.8rem to 5.9rem): the hero headline only.
- **Headline** (300, 2.2rem to 4rem): section titles.
- **Title** (700, 1.4rem): stop names, lot names.
- **Body** (400, 1.125rem, 1.6): paragraphs capped near 60ch.
- **Caption** (1rem) and **Label** (0.875rem, 700): tickets, dates, tags and credits.

## Layout

- Hero in two columns on desktop (headline, then the bag on its disc with tools around it); on phones the bag leads and the headline sits under it.
- Sections are open on the haze, content capped at 70rem (84rem for route and brew).
- Route: map and timeline side by side from 960px, the map sticky; stacked on phones.
- Brew: methods, the tool, the recipe from 1100px; the methods become a scroller on narrower screens.

## Elevation & Depth

Depth is made of glass and light. Panels have a white hairline, a 1px luminous rim in the wake colors, and two soft shadows, one tight and one wide tinted with the wake. Glows are part of the material here: buttons, the lit stop, the disc and the nav thread are lights, not decoration.

## Shapes

Generous curves. Panels use 24px, small cards 16px, buttons and tabs are pills, stops are circles. The disc is a perfect circle scattered with tone-on-tone coffee beans, a few of them yellow.

## Components

### Buttons
- **Primary:** espresso fill, white text, pill, 3.75rem tall, a tinted shadow. Its halo and its text glow with proximity (`--near`).
- **Glass:** translucent white with a hairline, same size and halo.

### Lot selector
A glass capsule with a sliding indicator filled with the lot's two fill colors. The indicator slides and recolors when the lot changes.

### Knots, thread and footprints
- **Knot:** circle with a stop number. Upcoming = white; reached = filled with the lot's fills; current = sun yellow with a pulsing glow. A dashed ring means the place is still pending.
- **Thread:** a glowing line in the lot's wake color. Dotted when either end is pending.
- **Footprints and beans:** coffee-brown shoe prints appear in order along the route, older ones settling back; beans fall from the head and burst at each stop. Only on the map. Prints on pending legs are lighter.
- **Origin ticket:** each stop shows name, place, kind and date, with a dashed "ubicación por confirmar" tag when pending, plus real photos or logos from the store.

### Bag and tools
The bag sits on the brand disc with a slow shine sweep, sparkles, a floor shadow and a reflection; it tilts and catches a colored sheen under the pointer. The bag is a matte plum pouch with a crimped seal and zipper, the logo mark, the wordmark and a bean trail ending in a yellow bean. The tools are real photographs cut out from their backgrounds, floating around it.

### Brew
A glass stage with the tool photo and a water gauge, a recipe panel with a dose slider, a ring timer and steps that light up as they run.

## Do's and Don'ts

### Do:
- **Do** keep text in espresso or roast soft on blush or white, and run `npm test` after any color change; contrast is tested on every lot and on the strongest haze.
- **Do** keep the footprints and beans on the map only.
- **Do** keep the illustrative route marked "ubicación por confirmar" until real places and dates arrive.
- **Do** keep buttons and headline letters glowing near the pointer, and stop all of it for reduced motion.

### Don't:
- **Don't** make anything follow the pointer around the page; the effects react only near their element.
- **Don't** add a dark ground, gradient text, a kicker above headings, or hard offset shadows.
- **Don't** light more than one stop at a time.
- **Don't** use stripes, folk motifs or retro chrome.
