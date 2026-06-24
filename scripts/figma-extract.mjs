import fs from 'fs';

const token = fs
  .readFileSync('.env.figma.local', 'utf8')
  .match(/FIGMA_ACCESS_TOKEN=(.+)/)?.[1]
  ?.trim();
const fileKey = 'jNCJojcQan3baUNAPXylPJ';

async function figma(path) {
  const res = await fetch(`https://api.figma.com/v1${path}`, {
    headers: { 'X-Figma-Token': token },
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json();
}

function rgb(c) {
  if (!c) return null;
  const r = Math.round(c.r * 255);
  const g = Math.round(c.g * 255);
  const b = Math.round(c.b * 255);
  const a = c.a ?? 1;
  return a < 1 ? `rgba(${r},${g},${b},${a.toFixed(2)})` : `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function summarize(node, depth = 0) {
  const indent = '  '.repeat(depth);
  const lines = [];
  const bb = node.absoluteBoundingBox;
  const size = bb ? `${Math.round(bb.width)}×${Math.round(bb.height)}` : '';
  const fill = node.fills?.[0]?.type === 'SOLID' ? rgb(node.fills[0].color) : '';
  const text = node.characters ? ` "${node.characters.replace(/\n/g, ' ')}"` : '';
  const style = node.style
    ? ` ${node.style.fontFamily} ${node.style.fontWeight} ${node.style.fontSize}px`
    : '';
  lines.push(`${indent}${node.type} ${node.name}${text}${fill ? ` fill=${fill}` : ''}${style}${size ? ` ${size}` : ''}`);
  for (const child of node.children || []) {
    lines.push(...summarize(child, depth + 1));
  }
  return lines;
}

function listFrames(node, out = []) {
  if (node.type === 'FRAME' && node.name.includes('·')) {
    out.push({ id: node.id, name: node.name, w: node.absoluteBoundingBox?.width, h: node.absoluteBoundingBox?.height });
  }
  for (const child of node.children || []) listFrames(child, out);
  return out;
}

const file = await figma(`/files/${fileKey}?depth=4`);
const frames = [];
for (const page of file.document.children) {
  listFrames(page, frames);
}
fs.mkdirSync('.local', { recursive: true });
fs.writeFileSync('.local/figma-all-frames.json', JSON.stringify(frames, null, 2));

const targets = {
  'COMP-01': '2:2795',
  'SA-01': '2:321',
  'RC-DEMO-01': '2:1185',
  'AUTH-01': '2:272',
  'DR-01': '2:1839',
};
const ids = Object.values(targets).join(',');
const nodes = await figma(`/files/${fileKey}/nodes?ids=${encodeURIComponent(ids)}`);
for (const [label, id] of Object.entries(targets)) {
  const doc = nodes.nodes[id].document;
  const summary = summarize(doc).join('\n');
  fs.writeFileSync(`.local/figma-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.txt`, summary);
  console.log(`\n=== ${label} ===\n${summary.slice(0, 1500)}`);
}
