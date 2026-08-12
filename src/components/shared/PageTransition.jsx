import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const fadeInUp = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const scaleIn = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

const slideInRight = {
  initial: {
    opacity: 0,
    x: 50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

const slideInLeft = {
  initial: {
    opacity: 0,
    x: -50,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};

export default function PageTransition({ children, className = '' }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeInUp({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      variants={scaleIn}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideInRight({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      variants={slideInRight}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function SlideInLeft({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      variants={slideInLeft}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CardHover({ children, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ButtonPress({ children, className = '' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

export function ListItemAnimation({ children, index, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ModalAnimation({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function OverlayAnimation({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export { pageVariants, staggerContainer, fadeInUp, scaleIn, slideInRight, slideInLeft };
