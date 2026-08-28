# Meta targeting artwork

Created with built-in ImageGen from the user-supplied 3D Meta/darts reference.
The generated 1536 × 1024 PNG was converted to a 1200 × 800 WebP at quality 90.
Astro produces 360, 640 and 960 px delivery variants at build time.

This is a rendered illustration with CSS perspective tilt, not a freely rotatable
3D mesh. There is no WebGL, video, added runtime package or perpetual JS loop.
Pointer input is bounded to ±6° / ±8°, and vertical touch scrolling stays native.
Motion pauses outside the viewport, on hidden tabs and via the pause button;
reduced-motion users receive a static illustration. All campaign copy is retained.

Validation: `node scripts/verify-meta-motion.mjs` tests interaction logic with DOM
mocks. Production HTML and image variants were checked. Browser/device rendering
and Lighthouse were not tested in this update.

## Generation prompt

Use case: ads-marketing. Asset type: standalone website hero 3D render, landscape 3:2.
Input image 1 is a visual reference for the exact subject, glossy materials,
perspective and composition, not a screenshot to reproduce.
Create one polished high-resolution clean studio render very close to the
reference: a large thick extruded cobalt-blue Meta infinity mark, upright and
floating slightly above a seamless pure white floor; blue front faces with darker
thick side faces and crisp glossy bevel highlights. Match the reference's
three-quarter camera perspective, with the left loop larger/nearer, logo filling
the left and middle of the composition.
Exactly THREE glossy emerald/lime-green and white darts approach from the right,
their green metal points embedded close together at the central crossing of the
infinity logo. Each dart has a white barrel/shaft section, glossy saturated green
collar and tail stem, and glossy green flight fins. Fan the three dart tails
vertically on the right: upper, middle, lower, closely matching the reference.
Keep the complete infinity logo and ALL THREE darts fully within frame, including
every fin and dart tip, with roughly ten percent clean breathing room around the
full assembly. Landscape 3:2 composition. Soft realistic contact shadows below,
bright professional studio lighting, highly polished dimensional 3D marketing
aesthetic, white background at all canvas edges. The only objects are one Meta
infinity mark and three darts.
Do not include dark screenshot borders, UI, text, watermark, extra darts, cropped
fins, motion streaks or decorative graphics.
