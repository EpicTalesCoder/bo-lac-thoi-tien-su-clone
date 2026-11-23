/** Source-indexed Green Farm 3 readers for original Gameloft resource packs. */
import { loadSplitPack, readPackBlock } from './bsprite-loader.js';

function checkedByte(data, offset, label) {
  if (!Number.isInteger(offset) || offset < 0 || offset >= data.length) {
    throw new RangeError(`Truncated ${label} at ${offset}`);
  }
  return data[offset];
}

function checkedU16(data, offset, label) {
  if (offset < 0 || offset + 2 > data.length) throw new RangeError(`Truncated ${label} at ${offset}`);
  return new DataView(data.buffer, data.byteOffset + offset, 2).getUint16(0, true);
}

function checkedI16(data, offset, label) {
  if (offset < 0 || offset + 2 > data.length) throw new RangeError(`Truncated ${label} at ${offset}`);
  return new DataView(data.buffer, data.byteOffset + offset, 2).getInt16(0, true);
}

function checkedI32(data, offset, label) {
  if (offset < 0 || offset + 4 > data.length) throw new RangeError(`Truncated ${label} at ${offset}`);
  return new DataView(data.buffer, data.byteOffset + offset, 4).getInt32(0, true);
}

// Port of g.java:15-58 (table header, widths, and signed Java cells).
export function decodeConfigTable(data) {
  const rowCount = checkedI32(data, 0, 'table row count');
  const columnCount = checkedI32(data, 4, 'table column count');
  if (rowCount < 0 || columnCount < 0 || rowCount > 100000 || columnCount > 4096) {
    throw new RangeError(`Invalid config table dimensions ${rowCount}x${columnCount}`);
  }
  let offset = 8;
  const widths = Array.from({ length: columnCount }, (_, column) => checkedByte(data, offset++, `table column ${column} width`));
  if (widths.some((width) => width !== 1 && width !== 2 && width !== 4)) {
    throw new RangeError(`Unsupported config widths: ${widths.join(',')}`);
  }
  const rows = [];
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = [];
    for (const width of widths) {
      if (offset + width > data.length) throw new RangeError(`Truncated config cell at ${offset}`);
      if (width === 1) row.push((data[offset] << 24) >> 24);
      else if (width === 2) row.push(checkedI16(data, offset, `table row ${rowIndex} cell`));
      else row.push(checkedI32(data, offset, `table row ${rowIndex} cell`));
      offset += width;
    }
    rows.push(row);
  }
  if (offset !== data.length) throw new RangeError(`Config table has ${data.length - offset} unexplained trailing bytes`);
  return { rowCount, columnCount, widths, rows };
}

const SCRIPT_ARGUMENT_WIDTHS = new Map([
  [11, [2, 2]], [12, [2, 2]], [21, [2, 2]], [22, [1, 1]],
  [102, [2]], [103, [2, 2, 2, 2]], [104, [2, 2, 2, 2]],
  [105, [2, 2, 2, 2]], [106, [2, 2]], [107, [2]],
  [108, [2, 2, 2, 2]], [109, [2, 2, 2, 2]], [110, [2, 2, 2]],
  [111, [2, 2]], [112, [2, 2]], [113, []], [114, [2, 2]],
  [115, [2, 2]], [116, []],
]);

// Port of a.java:17322-17548 and bytecode a.javap.txt:70632+ for /10 scripts.
export function decodeWorldScript(data) {
  let offset = 0;
  const take = (size, label) => {
    if (offset + size > data.length) throw new RangeError(`Truncated ${label} at ${offset}`);
    const start = offset;
    offset += size;
    return start;
  };
  const u8 = (label) => data[take(1, label)];
  const u16 = (label) => checkedI16(data, take(2, label), label);
  const scripts = [];
  const outerCount = u8('outer script count');
  for (let scriptIndex = 0; scriptIndex < outerCount; scriptIndex += 1) {
    take(2, 'outer script header');
    const groupCount = u8('script group count');
    const groups = [];
    for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
      const groupType = u8('script group type');
      let context;
      if (groupType === 0 || groupType === 1) context = u8('script byte context');
      else if (groupType === 2) { take(1, 'script context marker'); context = u16('script word context'); }
      else throw new RangeError(`Unsupported source script group type ${groupType}`);
      const recordCount = u16('script record count');
      const records = [];
      for (let recordIndex = 0; recordIndex < recordCount; recordIndex += 1) {
        const eventKey = u16('script event key');
        const commands = [];
        const commandCount = u8('script command count');
        for (let commandIndex = 0; commandIndex < commandCount; commandIndex += 1) {
          const sourceOffset = offset;
          const opcode = u8('script opcode');
          const widths = SCRIPT_ARGUMENT_WIDTHS.get(opcode);
          if (!widths) throw new RangeError(`Unknown source script opcode ${opcode} at ${sourceOffset}`);
          const args = widths.map((width) => width === 1
            ? (u8('script byte argument') << 24) >> 24
            : u16('script word argument'));
          commands.push({ opcode, args, sourceOffset });
        }
        records.push({ eventKey, commands });
      }
      groups.push({ groupType, context, records });
    }
    scripts.push({ groups });
  }
  if (offset !== data.length) throw new RangeError(`/10 script leaves ${data.length - offset} unparsed bytes`);
  return { outerCount, scripts };
}

// Port of a.java:x(): /10 blocks 2, 0 and 1 are respectively dimensions,
// per-cell tile IDs and per-cell attributes (delegated to i.a at i.java:315-350).
// Port of i.java:315-350: setup consumes the first two shorts of /10 block 2,
// stores block 0 and block 1 as byte planes, and uses source dimensions for bounds.
export function decodeTileMap(dimensions, tileIds, attributes) {
  if (dimensions.length < 4) throw new RangeError('Truncated /10 tile-map dimensions');
  const width = checkedI16(dimensions, 0, '/10 tile-map width');
  const height = checkedI16(dimensions, 2, '/10 tile-map height');
  if (width <= 0 || height <= 0) throw new RangeError(`Invalid source tile-map dimensions ${width}x${height}`);
  const cellCount = width * height;
  if (tileIds.length !== cellCount || attributes.length !== cellCount) {
    throw new RangeError(`Source /10 tile planes must each contain ${cellCount} cells`);
  }
  return {
    width,
    height,
    tileWidth: 36,
    tileHeight: 18,
    tileIds: Uint8Array.from(tileIds),
    attributes: Uint8Array.from(attributes),
    tileIdSemantics: 'numeric source tile indices; frame registry mapping unresolved',
    attributeSemantics: 'numeric source per-cell attribute byte',
  };
}

// Port of a.java:u(int), a.java:1881-2005, and javap a.javap.txt:12016-12431.
// The source scans byte markers; a type-50 branch consumes 12 bytes total,
// so each following marker probe begins at the preceding record's byte 12.
// Preserve offsets/unknown bytes instead of inventing a semantic struct.
export function decodeWorldEntities(data) {
  const records = [];
  let offset = 0;
  while (offset < data.length) {
    const start = offset;
    const recordType = checkedByte(data, offset++, 'world record type');
    if (recordType === 50) {
      const opaqueKey = checkedI16(data, offset, 'entity short field'); offset += 2;
      const x = checkedI16(data, offset, 'entity x field'); offset += 2;
      const y = checkedI16(data, offset, 'entity y field'); offset += 2;
      offset += 1; // source skips byte +7 before reading category at +8
      const categoryOffset = offset;
      const category = checkedByte(data, offset++, 'entity category');
      const entityIdOffset = offset;
      const entityId = (checkedByte(data, offset++, 'entity id') << 24) >> 24;
      const skippedBytes = [...data.slice(offset, offset + 2)];
      offset += 2;
      records.push({ recordType, sourceOffset: start, opaqueKey, x, y, category, categoryOffset, entityId, entityIdOffset, skippedBytes });
      continue;
    }
    if (recordType === 54) {
      const flagsMask = checkedI16(data, offset, 'entity flags mask'); offset += 2;
      const threshold = (checkedByte(data, offset++, 'entity threshold') << 24) >> 24;
      records.push({ recordType, sourceOffset: start, flagsMask, threshold, identity: 'unresolved type-54 world record' });
      continue;
    }
    // Unknown marker: mirrors the parser's single-byte loop increment.
    records.push({ recordType, sourceOffset: start, identity: 'unknown source byte marker' });
  }
  return records;
}

// Port of a.java:1881-2005, g.java:15-122 and e.java:2981-2997.
// Registry/config columns are numeric source facts, not semantic asset labels.
export function joinCategory32Entities(records, configTable) {
  return records.filter((record) => record.recordType === 50 && record.category === 32).map((record) => {
    const config = configTable.rows[record.entityId];
    if (!config) throw new RangeError(`Entity config row ${record.entityId} is absent`);
    return {
      sourceEntityId: record.entityId,
      identity: 'unresolved numeric source entity',
      worldPosition: { x: record.x, y: record.y },
      configTableId: 15,
      configRow: record.entityId,
      config,
      spriteRegistryIndex: config[1],
      frameIndex: config[2],
      animationIndex: config[5],
    };
  });
}

export async function loadOriginalWorldResources({ baseUrl = new URL('assets/packs/', import.meta.url).href, fetcher = fetch } = {}) {
  const pack9 = await loadSplitPack(new URL('9/9', baseUrl).href, fetcher);
  const pack10 = await loadSplitPack(new URL('10/10', baseUrl).href, fetcher);
  const table9 = (index) => decodeConfigTable(readPackBlock(pack9, index));
  const config15 = table9(15);
  const openingEntities = decodeWorldEntities(readPackBlock(pack10, 16));
  const tileMap = decodeTileMap(
    readPackBlock(pack10, 2),
    readPackBlock(pack10, 0),
    readPackBlock(pack10, 1),
  );
  return {
    packs: { 9: pack9, 10: pack10 },
    config15,
    openingScript: decodeWorldScript(readPackBlock(pack10, 15)),
    openingEntities,
    joinedEntities: joinCategory32Entities(openingEntities, config15),
    tileMap,
    table9,
  };
}
