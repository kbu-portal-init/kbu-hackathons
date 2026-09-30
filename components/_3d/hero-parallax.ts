/**
 * Hero scroll progress, shared as a module singleton.
 *
 * Written by ScrollFx from a ScrollTrigger `onUpdate`, read by the three.js
 * render loop in RoomScene. Deliberately not React state: the writer and the
 * reader never share render timing, and making it state would re-render the
 * tree on every scroll frame.
 *
 * Living in a plain module (not a client component) means both the ScrollFx
 * client component and RoomExperience can import it without a function ever
 * crossing the server→client boundary.
 */
export const heroParallax = { current: 0 };
