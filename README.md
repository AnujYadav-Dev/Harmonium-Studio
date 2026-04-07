# Harmonium

A keyboard-driven harmonium built with Next.js, Tailwind CSS, Framer Motion, and the Web Audio API. The app renders a minimal desktop-first instrument UI and synthesizes harmonium-like notes in the browser using layered harmonic oscillators, a soft attack, a sustained body, subtle vibrato, and a long release.

## Features

- Play a two-octave chromatic range from `C3` to `B4`
- Trigger notes directly from the physical keyboard
- Sustain while held and fade naturally on key release
- Harmonium-style synthesis using three harmonic partials
- Lazy `AudioContext` initialization to satisfy browser autoplay rules
- Press-state key animations powered by Framer Motion
- On-screen legend showing keyboard-to-note mapping
- Strict TypeScript setup with no `any` types

## Tech Stack

- [Next.js](https://nextjs.org/)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://motion.dev/docs/react)
- Web Audio API

## Getting Started

### Prerequisites

- Node.js `20.9.0` or newer
- npm

### Install

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm run start
```

### Type checking

```bash
npm run typecheck
```

## Keyboard Controls

The instrument maps one chromatic note per keyboard key across two octaves.

### Lower octave

| Keyboard | Note |
| --- | --- |
| `Z` | `C3` |
| `S` | `C#3` |
| `X` | `D3` |
| `D` | `D#3` |
| `C` | `E3` |
| `V` | `F3` |
| `G` | `F#3` |
| `B` | `G3` |
| `H` | `G#3` |
| `N` | `A3` |
| `J` | `A#3` |
| `M` | `B3` |

### Upper octave

| Keyboard | Note |
| --- | --- |
| `Q` | `C4` |
| `2` | `C#4` |
| `W` | `D4` |
| `3` | `D#4` |
| `E` | `E4` |
| `R` | `F4` |
| `5` | `F#4` |
| `T` | `G4` |
| `6` | `G#4` |
| `Y` | `A4` |
| `7` | `A#4` |
| `U` | `B4` |

## Sound Design

Each note is synthesized in the browser with:

- A fundamental oscillator
- A 2nd harmonic partial
- A 3rd harmonic partial
- Gain shaping with a soft attack of about `80ms`
- A long release of about `600ms`
- Gentle vibrato applied through an LFO for a more air-driven, reed-like texture

Held notes are not retriggered on repeated `keydown` events. The app checks `event.repeat` and also tracks active voices internally to avoid duplicate oscillator graphs.

## Project Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
features/
  harmonium/
    components/
    constants/
    hooks/
    lib/
    types/
tailwind.config.ts
```

## Architecture Notes

- `features/harmonium/types/`
  Defines shared interfaces for note data, UI state, audio nodes, and component props.
- `features/harmonium/constants/`
  Builds the full keyboard-to-note map and exports Framer Motion variants.
- `features/harmonium/hooks/`
  Manages `AudioContext`, note playback, release envelopes, active voice tracking, and sequences.
- `features/harmonium/components/`
  Renders visual keys, sequence panels, and mapping guides.
- `app/page.tsx`
  Wires global keyboard listeners to the harmonium hook and renders the full UI.

## Design Constraints

- Tailwind CSS only, with no inline styles
- Functional React components only
- Framer Motion variants defined outside component bodies
- No external audio samples
- No `any` types

## Browser Notes

- Audio starts only after the first user interaction because browsers block autoplayed audio contexts.
- Desktop keyboard input is the intended interaction model.
- Mobile touch support, MIDI input, and recording are intentionally out of scope for this version.

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Create a production build |
| `npm run start` | Run the production server |
| `npm run typecheck` | Run TypeScript checks without emitting files |
| `npm run lint` | Run Next.js linting |

## Future Ideas

- Add octave shifting
- Add drone stops for traditional harmonium textures
- Add configurable timbre and vibrato depth
- Add MIDI support
- Add recording and playback

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
