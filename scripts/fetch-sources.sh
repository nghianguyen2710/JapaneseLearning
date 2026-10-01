#!/usr/bin/env bash
# Tải lại các nguồn mở vào content/raw/ (JMdict, KANJIDIC2, Unihan, Tatoeba).
# Bộ thẻ Minna (content/raw/minna/) và danh sách ngữ pháp (content/raw/grammar/) nằm trong git, không tải ở đây.
# Phiên bản được ghim để chạy lại cho ra cùng dữ liệu; đổi phiên bản thì cập nhật docs/sources.md.
set -euo pipefail

JMDICT_VERSION="3.6.2+20260928191014"
UNIHAN_URL="https://www.unicode.org/Public/UCD/latest/ucd/Unihan.zip"
TATOEBA="https://downloads.tatoeba.org/exports"

RAW="$(cd "$(dirname "$0")/.." && pwd)/content/raw"
mkdir -p "$RAW"/{jmdict,unihan,tatoeba}

v="${JMDICT_VERSION//+/%2B}"
base="https://github.com/scriptin/jmdict-simplified/releases/download/$v"
echo "→ JMdict + KANJIDIC2 ($JMDICT_VERSION)"
curl -fsSL "$base/jmdict-eng-$v.json.tgz" | tar xz -C "$RAW/jmdict"
curl -fsSL "$base/kanjidic2-en-$v.json.tgz" | tar xz -C "$RAW/jmdict"

echo "→ Unihan"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT
curl -fsSL -o "$tmp/Unihan.zip" "$UNIHAN_URL"
unzip -oq "$tmp/Unihan.zip" Unihan_Readings.txt -d "$RAW/unihan"

echo "→ Tatoeba"
for lang in jpn vie eng; do
  curl -fsSL "$TATOEBA/per_language/$lang/${lang}_sentences.tsv.bz2" | bunzip2 > "$RAW/tatoeba/${lang}_sentences.tsv"
done
# links.csv đầy đủ ~440MB: chỉ giữ liên kết câu Nhật → bản dịch Việt/Anh
curl -fsSL "$TATOEBA/links.tar.bz2" | tar xjO links.csv | node -e '
const fs = require("fs");
const readline = require("readline");
const dir = process.argv[1];
const ids = (l) => new Set(fs.readFileSync(`${dir}/${l}_sentences.tsv`, "utf8").split("\n").map((r) => r.split("\t", 1)[0]));
const jpn = ids("jpn"), vie = ids("vie"), eng = ids("eng");
const out = fs.createWriteStream(`${dir}/jpn_links.tsv`);
readline.createInterface({ input: process.stdin }).on("line", (line) => {
  const [a, b] = line.split("\t");
  if (!jpn.has(a)) return;
  if (vie.has(b)) out.write(`${a}\t${b}\tvie\n`);
  else if (eng.has(b)) out.write(`${a}\t${b}\teng\n`);
}).on("close", () => out.end());
' "$RAW/tatoeba"

echo "✓ Xong. Dung lượng:"
du -sh "$RAW"/*/*
