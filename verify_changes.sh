#!/bin/bash

# Script to verify all charts have axis labels
echo "Verifying all charts have axis labels..."

# Count total charts in the project
total_charts=$(grep -r "<\(BarChart\|LineChart\)" /home/tejasn27/quantum-bb84-playground-52/src /home/tejasn27/quantum-bb84-playground-52/quantum-bb84-playground/src | wc -l)
echo "Total charts found: $total_charts"

# Count charts with axis labels
charts_with_labels=$(grep -r "XAxis.*label=" /home/tejasn27/quantum-bb84-playground-52/src /home/tejasn27/quantum-bb84-playground-52/quantum-bb84-playground/src | wc -l)
echo "Charts with X-axis labels: $charts_with_labels"

# Check if all charts have labels
if [ "$total_charts" -eq "$charts_with_labels" ]; then
    echo "✅ SUCCESS: All charts have been updated with axis labels!"
else
    echo "⚠️  WARNING: Not all charts have been updated with axis labels."
    echo "Expected: $total_charts charts with labels"
    echo "Found: $charts_with_labels charts with labels"
fi

echo ""
echo "Verification complete."