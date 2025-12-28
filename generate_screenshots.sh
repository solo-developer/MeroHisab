#!/bin/bash

README_FILE="README.md"
SCREENSHOT_FOLDER="screenshots"

# Temporary file for generated HTML
TEMP_FILE=$(mktemp)

# Start Screenshots section
echo "## 📱 Screenshots" > $TEMP_FILE
echo "" >> $TEMP_FILE
echo "<table>" >> $TEMP_FILE

# Counter for images per row
count=0

# Loop through all images
for file in $SCREENSHOT_FOLDER/*.{png,jpg,jpeg,jfif}; do
    [ -e "$file" ] || continue

    # Start a new row if count is 0
    if [ $((count % 3)) -eq 0 ]; then
        echo "<tr>" >> $TEMP_FILE
    fi

    # Add image with explicit width & height
    echo "  <td><img src=\"$file\" width=\"200\" height=\"150\"/></td>" >> $TEMP_FILE

    count=$((count + 1))

    # Close the row after 3 images
    if [ $((count % 3)) -eq 0 ]; then
        echo "</tr>" >> $TEMP_FILE
    fi
done

# Close the last row if not closed
if [ $((count % 3)) -ne 0 ]; then
    echo "</tr>" >> $TEMP_FILE
fi

echo "</table>" >> $TEMP_FILE

# Replace existing Screenshots section in README
if grep -q "## 📱 Screenshots" "$README_FILE"; then
    # Delete everything from the Screenshots section onward
    sed -i '/## 📱 Screenshots/,$d' "$README_FILE"
fi

# Append new HTML table
cat $TEMP_FILE >> "$README_FILE"

# Clean up
rm $TEMP_FILE

echo "README.md updated with screenshots table (3 images per row)!"
