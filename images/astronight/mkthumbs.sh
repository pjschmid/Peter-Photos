mkdir -o thumbs
for f in *.jpg; do
  sips -Z 450 "$f" --out "thumbs/${f%.jpg}-thumb.jpg"
done
