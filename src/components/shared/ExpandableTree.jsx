import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ExpandableTree = ({ data, renderNode, level = 0 }) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node, nodeLevel, index) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.2, 
          delay: index * 0.03,
          ease: 'easeOut'
        }}
      >
        <div
          className="flex items-center gap-2 py-3 hover:bg-canvas-subtle cursor-pointer transition-colors border-b border-canvas-faint last:border-b-0"
          style={{ paddingLeft: `${nodeLevel * 20 + 16}px`, paddingRight: '16px' }}
          onClick={() => {
            if (hasChildren) {
              toggleNode(node.id);
            }
          }}
        >
          <motion.svg
            animate={{ rotate: isExpanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
            className={`w-4 h-4 flex-shrink-0 ${hasChildren ? 'text-ink-muted' : 'text-transparent'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </motion.svg>
          <div className="flex-1">
            {renderNode(node, nodeLevel)}
          </div>
        </div>
        
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden bg-canvas-subtle/30"
            >
              {node.children.map((child, idx) => renderTreeNode(child, nodeLevel + 1, idx))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-canvas-faint overflow-hidden">
      {data.map((node, index) => renderTreeNode(node, level, index))}
    </div>
  );
};

export default ExpandableTree;
