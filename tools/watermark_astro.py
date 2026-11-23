#!/usr/bin/env python3
"""Build the published astro images from the full-resolution originals.

For every original in img/astro/*.jpg (gitignored, never pushed) this writes:
  img/astro/webp-hero/<name>_hero.webp        long side 1920px
  img/astro/webp-hero/<name>_hero.jpg         only if that .jpg already exists
  img/astro/webp-gallery/<name>_gallery.webp  long side 800px

Each output gets a small corner watermark and copyright metadata (EXIF + XMP).

Usage:
  python3 -m venv .venv && .venv/bin/pip install Pillow
  .venv/bin/python tools/watermark_astro.py            # all originals
  .venv/bin/python tools/watermark_astro.py M42        # names containing "M42"
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

AUTHOR = "Alexander Hernandez"
WATERMARK = f"© {AUTHOR}"
COPYRIGHT = f"© {AUTHOR}. All rights reserved."
USAGE_TERMS = (
    "All rights reserved. No reuse, redistribution, modification, or AI/ML "
    "training without written permission. Contact: pl3nny@live.com"
)
WEB_STATEMENT = "https://pl3nny.github.io/"

ROOT = Path(__file__).resolve().parent.parent
ASTRO = ROOT / "img" / "astro"

# (folder, suffix, long side px, watermark height as fraction of short side)
VARIANTS = [
    ("webp-hero", "_hero", 1920, 0.018),
    ("webp-gallery", "_gallery", 800, 0.024),
]

FONT_CANDIDATES = [
    ("/System/Library/Fonts/Avenir Next.ttc", "Medium"),
    ("/System/Library/Fonts/HelveticaNeue.ttc", "Medium"),
    ("/System/Library/Fonts/Helvetica.ttc", None),
]


def load_font(size: int) -> ImageFont.FreeTypeFont:
    for path, style in FONT_CANDIDATES:
        if not Path(path).exists():
            continue
        for index in range(20):
            try:
                font = ImageFont.truetype(path, size, index=index)
            except OSError:
                break
            if style is None or font.getname()[1] == style:
                return font
    return ImageFont.load_default(size)


def xmp_packet() -> bytes:
    return f"""<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">
   <dc:creator><rdf:Seq><rdf:li>{AUTHOR}</rdf:li></rdf:Seq></dc:creator>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">{COPYRIGHT}</rdf:li></rdf:Alt></dc:rights>
   <xmpRights:Marked>True</xmpRights:Marked>
   <xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">{USAGE_TERMS}</rdf:li></rdf:Alt></xmpRights:UsageTerms>
   <xmpRights:WebStatement>{WEB_STATEMENT}</xmpRights:WebStatement>
   <photoshop:Credit>{AUTHOR}</photoshop:Credit>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>""".encode("utf-8")


def exif_bytes() -> bytes:
    # EXIF text is ASCII-only, so spell out "Copyright" instead of "©".
    exif = Image.Exif()
    exif[0x013B] = AUTHOR  # Artist
    exif[0x8298] = f"Copyright {AUTHOR}. All rights reserved."  # Copyright
    exif[0x010E] = f"Astrophotograph by {AUTHOR}. {USAGE_TERMS}"  # ImageDescription
    return exif.tobytes()


def resize_long_side(img: Image.Image, long_side: int) -> Image.Image:
    w, h = img.size
    scale = long_side / max(w, h)
    size = (max(1, round(w * scale)), max(1, round(h * scale)))
    return img.resize(size, Image.Resampling.LANCZOS)


def add_watermark(img: Image.Image, height_frac: float) -> Image.Image:
    w, h = img.size
    font_size = max(14, round(min(w, h) * height_frac))
    font = load_font(font_size)
    margin = round(min(w, h) * 0.022)

    probe = ImageDraw.Draw(img)
    left, top, right, bottom = probe.textbbox((0, 0), WATERMARK, font=font)
    x = w - margin - (right - left) - left
    y = h - margin - (bottom - top) - top

    # Soft dark shadow so the mark stays legible on bright stars/nebulae.
    shadow = Image.new("L", img.size, 0)
    ImageDraw.Draw(shadow).text((x, y), WATERMARK, font=font, fill=150)
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(1, font_size / 10)))
    text = Image.new("L", img.size, 0)
    ImageDraw.Draw(text).text((x, y), WATERMARK, font=font, fill=150)  # ~60% white

    out = Image.composite(Image.new("RGB", img.size, (0, 0, 0)), img, shadow)
    return Image.composite(Image.new("RGB", img.size, (255, 255, 255)), out, text)


def build(original: Path) -> None:
    src = Image.open(original)
    icc = src.info.get("icc_profile")
    base = src.convert("RGB")
    exif, xmp = exif_bytes(), xmp_packet()

    for folder, suffix, long_side, frac in VARIANTS:
        img = add_watermark(resize_long_side(base, long_side), frac)
        out_dir = ASTRO / folder
        out_dir.mkdir(exist_ok=True)

        webp = out_dir / f"{original.stem}{suffix}.webp"
        img.save(webp, "WEBP", quality=82, method=6, exif=exif, xmp=xmp,
                 icc_profile=icc)
        written = [webp.name]

        jpg = out_dir / f"{original.stem}{suffix}.jpg"
        if jpg.exists():
            img.save(jpg, "JPEG", quality=85, optimize=True, progressive=True,
                     exif=exif, xmp=xmp, icc_profile=icc)
            written.append(jpg.name)

        print(f"  {img.size[0]}x{img.size[1]}  " + ", ".join(written))


def main() -> None:
    filters = sys.argv[1:]
    originals = sorted(ASTRO.glob("*.jpg"))
    if filters:
        originals = [p for p in originals if any(f in p.name for f in filters)]
    if not originals:
        sys.exit(f"No originals found in {ASTRO} (they are gitignored; "
                 "this must run on the machine that has them).")
    for original in originals:
        print(original.name)
        build(original)


if __name__ == "__main__":
    main()
