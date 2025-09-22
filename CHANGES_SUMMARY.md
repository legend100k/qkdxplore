# Summary of Changes: Added Axis Labels to Charts

## Overview
Added X-axis and Y-axis labels to all charts in the application to improve understanding of the data visualization. This enhancement makes it easier for users to interpret the meaning of the axes in each chart.

## Files Updated

### Main Application Directory (`/src/components`)
1. **ReportsSection.tsx**
   - Added axis labels to the experiment data visualization chart
   - X-axis label varies by experiment type (e.g., "Noise Level (%)", "Eavesdropping Rate (%)")
   - Y-axis label added to show units (e.g., "Percentage", "Error Rate (%)")

2. **ExperimentsSection.tsx**
   - Added axis labels to the experiment results chart
   - X-axis label dynamically changes based on experiment type
   - Y-axis label added to show "Error Rate (%)"

3. **AnalysisSection.tsx**
   - Added axis labels to the efficiency data chart
   - X-axis labeled as "Basis Type"
   - Y-axis labeled as "Efficiency (%)"

4. **SimulationSection.tsx**
   - Added axis labels to all bar charts in the simulation analysis section
   - Charts include:
     * Simulation Metrics chart (X: "Metrics", Y: "Count")
     * Error Rate chart (X: "Metric", Y: "Error Rate (%)")
     * Key Rate chart (X: "Metric", Y: "Key Rate (%)")

### Quantum BB84 Playground Directory (`/quantum-bb84-playground/src/components`)
1. **ReportsSection.tsx**
   - Same updates as in the main application

2. **ExperimentsSection.tsx**
   - Same updates as in the main application

3. **AnalysisSection.tsx**
   - Same updates as in the main application

4. **SimulationSection.tsx**
   - Same updates as in the main application

## Technical Details
For each chart component:
- Added `label` property to `<XAxis>` component with appropriate label text and positioning
- Added `label` property to `<YAxis>` component with appropriate label text, angle, and positioning
- Used dynamic labels where applicable (based on experiment type or data series)
- Positioned labels to be clearly visible and readable
- Ensured labels don't overlap with chart data or tick marks

## Benefits
1. **Improved Data Interpretation**: Users can now immediately understand what each axis represents without additional context
2. **Better User Experience**: Clear labeling enhances the educational value of the application
3. **Professional Presentation**: Properly labeled charts meet standard data visualization best practices
4. **Accessibility**: Screen readers and other assistive technologies can better interpret the charts

## Testing
All charts have been verified to display correctly with the new axis labels. The labels are positioned appropriately and do not interfere with the chart data or other elements.