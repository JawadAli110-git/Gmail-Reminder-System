export const triggerHaptic = () => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate(50); // Light tap
  }
};

export const triggerHapticSuccess = () => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate([30, 50, 30]); 
  }
};

export const triggerHapticError = () => {
  if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
    window.navigator.vibrate([50, 100, 50, 100, 50]); 
  }
};
