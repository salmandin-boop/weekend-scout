#!/usr/bin/env bash
# Turns a city's carousel slides (from tools/social.js) into a 9:16 video for TikTok and Instagram Reels.
# Usage: tools/social_video.sh <slides-dir>   ->  <slides-dir>/video.mp4  (about 3 s per slide, 1080x1920, 30 fps)
set -euo pipefail
dir="$1"; out="$dir/video.mp4"; tmp="$(mktemp -d)"; per=3; fade=0.4; i=0
for img in "$dir"/0*.jpg; do
  i=$((i+1))
  ffmpeg -loglevel error -y -framerate 30 -i "$img" -vf "scale=1080:1350,pad=1080:1920:0:285:color=0x111A30,format=yuv420p,loop=-1:1,trim=duration=${per},fade=t=in:st=0:d=${fade},fade=t=out:st=$(echo "$per-$fade" | bc):d=${fade}" \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -r 30 "$tmp/p$(printf %02d $i).mp4"
done
ls "$tmp"/p*.mp4 | sed "s/^/file '/;s/$/'/" > "$tmp/list.txt"
ffmpeg -loglevel error -y -f concat -safe 0 -i "$tmp/list.txt" -c copy -movflags +faststart "$tmp/v.mp4"
mv "$tmp/v.mp4" "$out"; rm -rf "$tmp"; echo "$out"
