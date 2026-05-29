function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-NP', { maximumFractionDigits: 0 })}`;
}

function parseSpecs(text) {
  const specs = {};
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separatorIndex = line.indexOf(':');
      if (separatorIndex === -1) return;
      const key = line.slice(0, separatorIndex).trim();
      const value = line.slice(separatorIndex + 1).trim();
      if (key && value) specs[key] = value;
    });
  return specs;
}

function specsToText(specs) {
  if (!specs) return '';
  const entries = specs instanceof Map ? Array.from(specs.entries()) : Object.entries(specs);
  return entries.map(([key, value]) => `${key}: ${value}`).join('\n');
}

module.exports = {
  formatCurrency,
  parseSpecs,
  specsToText,
};
