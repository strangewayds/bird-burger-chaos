# BIRD BURGER — "THE HEALTH INSPECTOR"
### A 27-second cartoon short · Episode 1 · "The Worst Restaurant on the Blockchain"

Made 2026-07-20 with Higgsfield (Seedance 2.0 for video, Nano Banana for stills).
Everything in this doc is reusable — same recipe makes Episode 2.

---

## THE CHARACTER (paste this into EVERY prompt)

> **Larry the Bird** — round fat purple cartoon bird, heavy-lidded permanently
> exhausted half-closed eyes, completely emotionless deadpan expression, orange
> beak and orange feet, dirty crumpled white paper fast-food hat with
> "BIRD BURGER" printed in red, greasy stained white apron, usually holding an
> oversized dripping cheeseburger. Adult late-night cartoon style, 2D/3D hybrid,
> grimy muted colors except Larry's vivid purple, slight VHS grain.

**Reference image (use in every clip):** `larry-ref.png` in this folder.
Regenerating him from scratch will drift — always attach the reference.

Supporting cast:
- **The Employee** — skinny nervous yellow bird, same uniform. No name. He has seen things.
- **Three health inspectors** — cheap grey suits, clipboards, quietly horrified.

---

## FULL SCRIPT

**COLD OPEN — EXT. BIRD BURGER, NIGHT**
Neon sign flickers: BIRD BURGER → BIRD BURNER. Smoke pours from the kitchen window.
CAPTION: *"8 minutes before opening."*

**INT. KITCHEN**
Larry stands motionless at the grill. The patties are on fire. He does not care.

> EMPLOYEE: Larry, the health inspector is here.
> *(Larry turns his head at the speed of continental drift. Long pause.)*
> LARRY: Which one?

**INT. DINING ROOM**
Three inspectors at a sticky table. The middle one lifts a burger's top bun with
two fingers. Something inside the burger **quietly coughs**. He puts the bun back
down and stares at nothing.

**INT. KITCHEN**
Larry calmly takes the fire extinguisher — and sprays the inspection paperwork
until it snowstorms across the kitchen. The grill keeps burning.

> LARRY: Inspection handled.
> *(The employee stares.)*

**INT. KITCHEN — FINALE**
Window sign: **GRADE: PENDING INVESTIGATION**. Larry looks dead into the
security camera, burning burger in hand.

> LARRY: We open in five.

The fryer explodes behind him. He does not blink.

**SMASH CUT — LOGO CARD**
BIRD BURGER logo. Tagline: *"WE'RE PRETTY SURE IT'S FOOD."*

---

## SHOT-BY-SHOT STORYBOARD + EDIT TIMELINE

| # | Clip | Dur | Camera | Beat |
|---|------|-----|--------|------|
| 1 | shot1-exterior.mp4 | 0:00–0:04 | Locked-off, slow push-in | Sign flicker BURGER→BURNER, smoke, caption |
| 2 | shot2-which-one.mp4 | 0:04–0:10 | Locked-off | Fire + "Which one?" |
| 3 | shot3-coughing-burger.mp4 | 0:10–0:15 | Slow push-in | Bun lift, cough, bun down |
| 4 | shot4-inspection-handled.mp4 | 0:15–0:21 | Locked-off | Extinguisher on paperwork |
| 5 | shot5-we-open-in-five.mp4 | 0:21–0:27 | Locked → sudden handheld shake | Camera stare, explosion, no reaction |
| 6 | endcard.png (2s hold) | 0:27–0:29 | Static | Logo + "WE'RE PRETTY SURE IT'S FOOD." |

Cut style: hard cuts only. No transitions. Transitions are for restaurants with
a passing grade.

---

## SOUND / DIALOGUE LIST

| Time | Sound |
|------|-------|
| 0:00 | Neon buzz, distant siren, low hum |
| 0:04 | Grease-fire sizzle, fluorescent buzz |
| 0:06 | EMPLOYEE: "Larry, the health inspector is here." |
| 0:08 | LARRY: "Which one?" (flat) |
| 0:10 | Fluorescent hum, near-silence |
| 0:13 | One tiny muffled cough (from inside burger) |
| 0:15 | Fire-extinguisher blast, papers fluttering |
| 0:19 | LARRY: "Inspection handled." |
| 0:22 | LARRY: "We open in five." |
| 0:23 | BOOM. Fryer explosion, debris, fire crackle |
| 0:27 | Cheap jingle sting, last note dies out flat |

Music: none until the logo card — the fluorescent hum IS the score. On the card,
a 2-second overly-cheerful fast-food jingle where the final note goes flat/dies.

---

## HIGGSFIELD RECIPE (repeatable)

1. Character ref once: `nano_banana_pro` (16:9) with the Larry paragraph above.
2. Every clip: `seedance_2_0`, 16:9, 4–6s, attach `larry-ref.png` as
   `image_references`, repeat the full Larry paragraph in the prompt.
3. Dialogue goes in quotes inside the prompt — Seedance 2.0 generates the voices
   and sound itself.
4. Negative/consistency guards (bake into the prompt as positives): "Keep his
   design exactly as the reference", "does not react, does not blink",
   "deadpan monotone". Avoid: cute/family-friendly/polished commercial look,
   Larry changing color, extra accessories, big expressive eyes, smiling.
5. Stitch: ffmpeg concat (see `stitch.ps1` / commands in session notes), end card
   appended as a 2s still.

The exact per-shot prompts used for v1 are in the Higgsfield generations history
(2026-07-20) and can be re-pulled with `show_generations`.
