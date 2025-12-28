#!/bin/bash

# Output Markdown header
echo "## 📱 Screenshots"
echo ""

# Loop through all images in screenshots folder
for file in screenshots/*.{png,jpg,jpeg}; do
  # Skip if no files match
  [ -e "$file" ] || continue
  # Extract filename without path for alt text
  alt_text=$(basename "$file")
  # Print Markdown image line
  echo "![${alt_text}]($file)"
done
