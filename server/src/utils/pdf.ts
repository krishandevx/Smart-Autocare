function esc(s: string): string {
  let out = '';
  for (const ch of s) {
    const c = ch.codePointAt(0)!;
    if (c === 40) out += '\\(';
    else if (c === 41) out += '\\)';
    else if (c === 92) out += '\\\\';
    else if (c < 128) out += ch;
    else if (c < 256) out += String.fromCharCode(c);
    else out += '?';
  }
  return out;
}

type Cell = { text: string; font?: '/F1' | '/F2'; x?: number };
export type PdfLine =
  | { text: string; font?: '/F1' | '/F2'; size?: number }
  | { rule: true }
  | { row: Cell[]; size?: number }
  | { margin: number };

export function buildInvoicePdf(input: PdfLine[]): Buffer {
  const left0 = 50;
  const ops: string[] = ['BT'];
  let y = 792;
  let left = left0;
  let curX = 0;
  let curY = 0;
  let lastFont = '';
  let lastSize = 0;

  const move = (x: number, yy: number) => {
    const dx = x - curX;
    const dy = yy - curY;
    ops.push(`${dx < 0 ? '' : ''}${Number(dx.toFixed(2))} ${Number(dy.toFixed(2))} Td`);
    curX = x;
    curY = yy;
  };

  const setFont = (font: string, size: number) => {
    if (font !== lastFont || size !== lastSize) {
      ops.push(`/${font.slice(1)} ${size} Tf`);
      lastFont = font;
      lastSize = size;
    }
  };

  for (const line of input) {
    if ('margin' in line) {
      left = left0 + line.margin;
      continue;
    }
    if ('rule' in line) {
      y -= 6;
      move(left0, y);
      ops.push(`0.7 0.7 0.7 RG 0 0 m 495 0 l S 0 G`);
      y -= 10;
      continue;
    }
    if ('row' in line) {
      let x = left;
      const size = line.size ?? 10;
      for (const cell of line.row) {
        const fx = cell.font ?? '/F1';
        setFont(fx, size);
        move(x, y);
        ops.push(`(${esc(cell.text)}) Tj`);
        x += cell.x ?? 0;
      }
      const dy = size * 1.35;
      y -= dy;
      move(left, y);
      continue;
    }
    const size = line.size ?? 10;
    const font = line.font ?? '/F1';
    setFont(font, size);
    move(left, y);
    ops.push(`(${esc(line.text)}) Tj`);
    y -= size * 1.45;
    move(left, y);
  }

  ops.push('ET');
  const content = Buffer.from(ops.join('\n') + '\n', 'latin1');

  const obj = (d: string) => Buffer.from(d, 'latin1');
  const objects = [
    obj('<</Type/Catalog/Pages 2 0 R>>'),
    obj('<</Type/Pages/Kids[3 0 R]/Count 1>>'),
    obj('<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R/F2 6 0 R>>>>/Contents 4 0 R>>'),
    Buffer.concat([obj(`<</Length ${content.length}>>stream\n`), content, obj('endstream')]),
    obj('<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>'),
    obj('<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold>>'),
  ];

  const header = obj('%PDF-1.4\n');
  const chunks: Buffer[] = [header];
  const offsets: number[] = [0];
  let running = header.length;
  for (let i = 0; i < objects.length; i++) {
    offsets.push(running);
    chunks.push(obj(`${i + 1} 0 obj\n`), objects[i], obj('\nendobj\n'));
    running += `${i + 1} 0 obj\n`.length + objects[i].length + '\nendobj\n'.length;
  }

  const xrefStart = running;
  const cross = Buffer.from(
    'xref\n0 7\n0000000000 65535 f \n' +
      offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('') +
      `trailer\n<</Size 7/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF\n`,
    'latin1',
  );

  return Buffer.concat([...chunks, cross]);
}

export function money(n: number): string {
  return n.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}