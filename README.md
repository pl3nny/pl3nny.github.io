# nightflare
Personal portfolio site for Alexander Hernandez (pl3nny), served at https://pl3nny.github.io/.

## Copyright

**The astrophotographs and other original images are © Alexander Hernandez — all rights reserved.**
They are not open source and may not be reused, redistributed, or used for AI training without
written permission. The site's code is MIT-licensed. See [LICENSE](LICENSE) for details.

## Regenerating the astro images

Full-resolution originals live in `img/astro/*.jpg` locally and are gitignored (never pushed).
The published web copies are watermarked and carry copyright metadata. To rebuild them:

```bash
python3 -m venv .venv && .venv/bin/pip install Pillow
.venv/bin/python tools/watermark_astro.py
```
