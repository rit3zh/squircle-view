const SMOOTHING_STEPS = [0, 0.25, 0.5, 0.75, 1] as const;

const LIST_ITEMS = Array.from({ length: 500 }, (_, index) => index);

export { SMOOTHING_STEPS, LIST_ITEMS };
