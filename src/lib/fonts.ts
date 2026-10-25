import { Caveat } from 'next/font/google';

// The handwritten face: polaroid captions in the photo carousel, and the notes
// in the book printed for the beneficiary. Shared so both use one font file;
// it is only preloaded on the routes that import it.
export const handwriting = Caveat({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
});
