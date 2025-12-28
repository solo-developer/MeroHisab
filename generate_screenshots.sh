#!/bin/bash

README_FILE="README.md"
SCREENSHOT_FOLDER="screenshots"

# Temporary file to store generated markdown
TEMP_FILE=$(mktemp)

# Generate Markdown for all screenshots
echo "## 📱 Screenshots" > $TEMP_FILE
echo "" >> $TEMP_FILE

for file in $SCREENSHOT_FOLDER/*.{png,jpg,jpeg,jfif}; do
    [ -e "$file" ] || continue
    alt_text=$(basename "$file")
    echo "![${alt_text}]($file)" >> $TEMP_FILE
done

# Replace the existing Screenshots section in README
if grep -q "## 📱 Screenshots" "$README_FILE"; then
    # Delete existing Screenshots section
    sed -i '/## 📱 Screenshots/,$d' "$README_FILE"
fi

# Append new Screenshots section
cat $TEMP_FILE >> "$README_FILE"

# Clean up temp file
rm $TEMP_FILE

echo "README updated with all screenshots from $SCREENSHOT_FOLDER!"
