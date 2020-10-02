// Helpers

// Look at all styles' descriptions to find a matching source style and return if found
function getSourceForStyle(style, styles) {
  for (const currentStyle of styles) {
    if (style.description === currentStyle.name) return currentStyle;
  }
  return null;
}

// Form pairs
function getReceiverSourcePairs(styles) {
  return styles.map((style) => ({
    receiver: style,
    source: getSourceForStyle(style, styles),
  }));
}

// Main plugin code
figma.showUI(__html__);

const styles = figma.getLocalPaintStyles();
const receiverSourcePairs = getReceiverSourcePairs(styles);

// New! Make sure to update paints  on plugin launch
receiverSourcePairs.forEach((pair) => {
  if (pair.source) {
    pair.receiver.paints = pair.source.paints;
  }
});

const receiverSourceData = receiverSourcePairs.map((pair) => ({
  receiver: {
    name: pair.receiver.name,
    id: pair.receiver.id,
  },
  source: {
    name: pair.source ? pair.source.name : "",
  },
}));

figma.ui.postMessage({
  type: "render",
  receiverSourceData,
});

// Handle message from UI
figma.ui.onmessage = (msg) => {
  if (msg.type == "update-source") {
    const receiverStyle = figma.getStyleById(msg.receiverId) as PaintStyle;
    const sourceStyle = styles.find(
      (style) => style.name === msg.newSourceName
    );
    if (!(receiverStyle && sourceStyle)) return;

    receiverStyle.description = msg.newSourceName;
    receiverStyle.paints = sourceStyle.paints;

    figma.notify(`New source style: ${msg.newSourceName}`);
  }
};
