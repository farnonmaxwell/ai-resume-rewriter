from pathlib import Path
import struct
import zlib

root = Path('/home/ubuntu/jass/client/public')
root.mkdir(parents=True, exist_ok=True)

NAVY = (10, 31, 52)
GOLD = (201, 162, 77)
WHITE = (255, 255, 255)

# A tiny 5x7 bitmap J, scaled for each icon size.
LETTER_J = [
    '11111',
    '00100',
    '00100',
    '00100',
    '00100',
    '10100',
    '01100',
]

def write_png(path: Path, width: int, height: int, pixels: list[list[tuple[int, int, int]]]) -> None:
    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xFFFFFFFF)

    raw = b''.join(b'\x00' + b''.join(bytes(px) for px in row) for row in pixels)
    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(raw, 9))
    png += chunk(b'IEND', b'')
    path.write_bytes(png)

def make_icon(size: int) -> None:
    pixels = [[NAVY for _ in range(size)] for _ in range(size)]
    margin = int(size * 0.12)
    border = max(4, int(size * 0.035))
    radius = int(size * 0.12)

    def in_round_rect_border(x: int, y: int) -> bool:
        inside_outer = margin <= x < size - margin and margin <= y < size - margin
        inside_inner = margin + border <= x < size - margin - border and margin + border <= y < size - margin - border
        # Keep the geometry simple and crisp; it is an app icon, not print art.
        return inside_outer and not inside_inner

    for y in range(size):
        for x in range(size):
            if in_round_rect_border(x, y):
                pixels[y][x] = GOLD

    glyph_scale = max(10, int(size * 0.055))
    glyph_w = len(LETTER_J[0]) * glyph_scale
    glyph_h = len(LETTER_J) * glyph_scale
    start_x = (size - glyph_w) // 2
    start_y = (size - glyph_h) // 2
    for row_idx, row in enumerate(LETTER_J):
        for col_idx, bit in enumerate(row):
            if bit == '1':
                for yy in range(start_y + row_idx * glyph_scale, start_y + (row_idx + 1) * glyph_scale):
                    for xx in range(start_x + col_idx * glyph_scale, start_x + (col_idx + 1) * glyph_scale):
                        if 0 <= xx < size and 0 <= yy < size:
                            pixels[yy][xx] = GOLD

    write_png(root / f'pwa-icon-{size}.png', size, size, pixels)

for icon_size in (192, 512):
    make_icon(icon_size)

print('Generated PWA icons in', root)
