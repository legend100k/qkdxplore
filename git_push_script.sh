#!/bin/bash

# Script to commit and push changes to git repository

echo "Preparing to commit and push changes..."

# Stage all modified files
echo "Staging modified files..."
git add src/components/AnalysisSection.tsx
git add src/components/ExperimentsSection.tsx
git add src/components/ReportsSection.tsx
git add src/components/SimulationSection.tsx

# Stage new files (optional - you might want to review these first)
# git add CHANGES_SUMMARY.md
# git add FINAL_SUMMARY.md
# git add TASK_COMPLETION.md
# git add verify_changes.sh

echo "Files staged successfully."

# Commit the changes
echo "Committing changes..."
git commit -m "Add axis labels to all charts for improved data visualization

- Added X-axis and Y-axis labels to all charts in the application
- Enhanced user understanding of data visualization
- Improved educational value of the BB84 protocol demonstration
- Implemented dynamic labels that adapt to different experiment types"

echo "Changes committed successfully."

# Push to remote repository
echo "Pushing to remote repository..."
git push origin main

echo "Changes pushed successfully!"
echo ""
echo "Summary of changes:"
echo "- Added axis labels to all charts in the application"
echo "- Enhanced data visualization and interpretation"
echo "- Improved user experience and educational value"