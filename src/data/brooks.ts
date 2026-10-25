import type { StaticImageData } from 'next/image';

import braveBuddy from '../../public/images/brooks/brave-buddy.png';
import cosmo from '../../public/images/brooks/cosmo.jpg';
import kindergarten from '../../public/images/brooks/first-day-of-kindergarten.jpg';
import thumbsUp from '../../public/images/brooks/hospital-thumbs-up.jpg';
import rockOn from '../../public/images/brooks/hospital-rock-on.jpg';
import laughs from '../../public/images/brooks/hospital-laughs.jpg';
import napBaseball from '../../public/images/brooks/hospital-nap-baseball-blanket.jpg';
import sunshine from '../../public/images/brooks/sending-sunshine.jpg';
import minion from '../../public/images/brooks/minion-halloween.jpg';
import mascotHug from '../../public/images/brooks/ballpark-mascot-hug.jpg';
import storyTime from '../../public/images/brooks/yankees-story-time.jpg';
import gameNight from '../../public/images/brooks/stadium-game-night.jpg';
import cheerleaders from '../../public/images/brooks/byu-cheerleaders.jpg';
import sideline from '../../public/images/brooks/byu-practice-sideline.jpg';
import frontPorch from '../../public/images/brooks/front-porch.jpg';
import nap from '../../public/images/brooks/hospital-nap.jpg';

// ============================================================
// BROOKS — the story and photos on the home and About pages
// ============================================================
// To add a photo: drop the file in public/images/brooks/, import it above,
// and add an entry to BROOKS_PHOTOS where you want it in the order. Width and
// height come from the import, so any shape works — the carousel crops every
// photo to a 3:4 portrait frame. If the crop cuts off the important part, set
// `focus` to move it (CSS object-position, e.g. "center 30%" keeps more of the
// top).
// ============================================================

export const BROOKS_TAGLINE = 'Small kid. Big fight.';

// The sticker beside the name.
export const BROOKS_BADGE = braveBuddy;

// The photo on the image people see when the site is shared in a text or a
// post (src/app/opengraph-image.tsx). A JPG file name in public/images/brooks/,
// not an import — that image is drawn on the server, from the file itself.
export const BROOKS_SHARE_PHOTO = 'cosmo.jpg';

// The home page tells it a line at a time: who Brooks is, what cancer has
// taken, the honest part, then the turn — and the photos prove it. The ask
// comes after the photos.
export const BROOKS_STORYLINE = {
  intro: 'Brooks is five years old. Six months ago, he was diagnosed with leukemia.',
  takenLabel: 'Since then, cancer has taken',
  taken: [
    'His hair.',
    'Six months of just being a kid.',
    'His first day of kindergarten.',
  ],
  truth: 'Round after round of treatment, every kind there is. Right now, things are hard — harder than any five-year-old should ever have to know.',
  turn: "It hasn't taken his smile.",
  ask: "Brooks can't run right now. So on November\u00a07, we'll run for him.",
};

// The About page tells the same story as prose.
export const BROOKS_STORY: string[] = [
  'Brooks Limb is five years old. Six months ago, he was diagnosed with leukemia, and since then he has been through round after round of treatment — every kind there is. He has lost all of his hair. He has spent more days in a hospital bed than any kid ever should. And this fall, while his classmates walked into their first day of kindergarten, Brooks was too sick to be there.',
  'Right now, things are hard. But through all of it, Brooks keeps smiling, keeps flashing the Y, and keeps showing everyone around him what brave looks like.',
  "Brooks can't run right now. So on November\u00a07, we'll run for him — every lap, every mile, every step.",
];

export interface BrooksPhoto {
  src: StaticImageData;
  alt: string;
  caption: string;
  focus?: string;
}

export const BROOKS_PHOTOS: BrooksPhoto[] = [
  {
    src: cosmo,
    alt: 'Brooks in a BYU cap and jacket throwing up the Y beside Cosmo the Cougar on the BYU football practice field',
    caption: 'True blue',
  },
  {
    src: kindergarten,
    alt: 'Brooks in a Yankees cap holding a "My First Day of Kindergarten" chalkboard sign on the front porch',
    caption: 'Ready for kindergarten',
  },
  {
    src: thumbsUp,
    alt: 'Brooks giving a big thumbs up from a hospital bed',
    caption: 'Thumbs up, even here',
  },
  {
    src: rockOn,
    alt: 'Brooks in a hospital bed holding a can of Pringles and throwing up a rock-on sign',
    caption: 'Rock on',
  },
  {
    src: laughs,
    alt: 'Brooks laughing on a hospital exam bed in a black beanie',
    caption: 'Still laughing',
  },
  {
    src: napBaseball,
    alt: 'Brooks asleep in a hospital bed under a baseball blanket',
    caption: 'Rest between rounds',
  },
  {
    src: sunshine,
    alt: 'Brooks grinning while holding a yellow gift box that reads "Sending you sunshine"',
    caption: 'Sending you sunshine',
  },
  {
    src: minion,
    alt: 'Brooks dressed as a Minion for Halloween in a yellow beanie and goggles, holding a trick-or-treat bucket',
    caption: 'Halloween, Minion-style',
    focus: 'center 30%',
  },
  {
    src: mascotHug,
    alt: 'Brooks hugging a bee mascot on the field at a baseball game',
    caption: 'Big hugs at the ballpark',
  },
  {
    src: storyTime,
    alt: 'Brooks in a Yankees cap and jersey sitting with a book',
    caption: 'Yankees kid',
  },
  {
    src: gameNight,
    alt: 'Brooks throwing up the Y on the field at a BYU night game',
    caption: 'Game night in Provo',
  },
  {
    src: cheerleaders,
    alt: 'BYU cheerleaders kneeling with pom-poms to meet Brooks on the sideline',
    caption: 'Personal cheer squad',
  },
  {
    src: sideline,
    alt: 'Brooks in a BYU cap sitting on the sideline at a BYU football practice',
    caption: 'Sideline pass',
  },
  {
    src: frontPorch,
    alt: 'Brooks in a Yankees cap smiling on the front porch next to a toddler holding a stuffed monkey',
    caption: 'Front-porch smiles',
  },
  {
    src: nap,
    alt: 'Brooks asleep in a hospital bed',
    caption: 'Rest up, buddy',
  },
];
