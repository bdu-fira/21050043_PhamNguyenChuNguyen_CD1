import { Variants } from 'framer-motion';

// Animation variants for staggered container elements
export const containerVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3
    }
  }
};

// Animation variants for child items in a staggered container
export const itemVariants: Variants = {
  hidden: { 
    y: 50, 
    opacity: 0 
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 12
    }
  }
};

// Animation variants for interactive buttons
export const buttonVariants: Variants = {
  hover: {
    scale: 1.05,
    boxShadow: "0px 8px 15px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  },
  tap: {
    scale: 0.95
  }
};

// Animation variants for elements that slide up on scroll
export const fadeInUpVariants: Variants = {
  hidden: { 
    y: 40, 
    opacity: 0 
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.7
    }
  }
};

// Animation variants for hover effects on cards
export const cardHoverVariants: Variants = {
  hover: { 
    y: -10,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
  }
};

// Animation variants for icon hover effects
export const iconHoverVariants: Variants = {
  initial: { 
    scale: 1 
  },
  hover: { 
    scale: 1.1 
  }
};

// Animation variants for scroll indicator
export const scrollIndicatorVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: -20 
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 1.5,
      duration: 0.8,
      repeat: Infinity,
      repeatType: "reverse"
    }
  }
};

// Animation variants for text links
export const linkHoverVariants: Variants = {
  initial: { 
    x: 0 
  },
  hover: { 
    x: 5 
  }
}; 