// One-off: cut dish photos out of the menu posters in resources/ into public/food/
import sharp from "sharp";
const r = "resources/", o = "public/food/";
const jobs = [
  ["1000016844.png", "ramen", { left: 560, top: 40, width: 460, height: 440 }],
  ["1000016844.png", "pancit", { left: 0, top: 700, width: 440, height: 400 }],
  ["1000004304.png", "waffle", { left: 860, top: 240, width: 554, height: 610 }],
  ["1000004303.png", "breakfast", { left: 860, top: 240, width: 554, height: 610 }],
  ["1000016845.png", "halohalo", { left: 400, top: 470, width: 560, height: 680 }],
  ["1000016679.png", "carbonara", { left: 0, top: 140, width: 320, height: 380 }],
];
for (const [f, n, box] of jobs)
  await sharp(r + f).extract(box).resize({ width: 640, withoutEnlargement: true }).webp({ quality: 80 }).toFile(o + n + ".webp");
