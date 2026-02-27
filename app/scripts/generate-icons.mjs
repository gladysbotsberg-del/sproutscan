import sharp from "sharp";
import { readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgBuffer = readFileSync(join(root, "public", "favicon.svg"));
const outDir = join(root, "public", "icons");

mkdirSync(outDir, { recursive: true });

const BG = "#FFFAF9";

async function generateIcon(size, name, maskable = false) {
  let pipeline = sharp(svgBuffer).resize(size, size);

  if (maskable) {
    // 10% padding on each side → icon occupies 80% of canvas
    const inner = Math.round(size * 0.8);
    const icon = await sharp(svgBuffer).resize(inner, inner).png().toBuffer();
    pipeline = sharp({
      create: { width: size, height: size, channels: 4, background: BG },
    })
      .composite([{ input: icon, gravity: "centre" }])
      .png();
  }

  const outPath = join(outDir, name);
  await pipeline.png().toFile(outPath);
  console.log(`  ✓ ${name} (${size}×${size})`);
}

console.log("Generating PWA icons...\n");

await Promise.all([
  generateIcon(192, "icon-192.png"),
  generateIcon(512, "icon-512.png"),
  generateIcon(180, "apple-icon.png"),
  generateIcon(192, "icon-maskable-192.png", true),
  generateIcon(512, "icon-maskable-512.png", true),
]);

console.log("\nDone! Icons written to public/icons/");
