export const easings = {
  cinematic: "power4.out",
  soft: "power2.out",
  spring: { type: "spring" as const, stiffness: 280, damping: 24 },
};

export const stagger = {
  cards: 0.1,
  text: 0.08,
};

export const durations = {
  page: 0.7,
  reveal: 1.1,
  hover: 0.45,
};
