// Mini sparkline charts for performance visualization

function createSparkline(percentage, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create mini SVG sparkline
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '40');
    svg.setAttribute('height', '20');
    svg.setAttribute('class', 'sparkline');
    
    // Background bar
    const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bgRect.setAttribute('x', '0');
    bgRect.setAttribute('y', '8');
    bgRect.setAttribute('width', '40');
    bgRect.setAttribute('height', '4');
    bgRect.setAttribute('fill', '#e9ecef');
    bgRect.setAttribute('rx', '2');
    
    // Progress bar
    const progressRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    progressRect.setAttribute('x', '0');
    progressRect.setAttribute('y', '8');
    progressRect.setAttribute('width', Math.min(percentage, 100) * 0.4);
    progressRect.setAttribute('height', '4');
    progressRect.setAttribute('rx', '2');
    
    // Color based on performance
    let color = '#dc3545'; // Red for poor
    if (percentage >= 100) color = '#198754'; // Green for excellent
    else if (percentage >= 80) color = '#fd7e14'; // Orange for good
    
    progressRect.setAttribute('fill', color);
    
    svg.appendChild(bgRect);
    svg.appendChild(progressRect);
    
    return svg;
}

// Generate trend sparkline for historical data
function createTrendSparkline(dataPoints, width = 60, height = 20) {
    if (!dataPoints || dataPoints.length < 2) return null;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('class', 'sparkline');
    
    const max = Math.max(...dataPoints);
    const min = Math.min(...dataPoints);
    const range = max - min || 1;
    
    // Create path for line
    let pathData = '';
    dataPoints.forEach((point, index) => {
        const x = (index / (dataPoints.length - 1)) * width;
        const y = height - ((point - min) / range) * height;
        pathData += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    path.setAttribute('stroke', '#0d6efd');
    path.setAttribute('stroke-width', '1.5');
    path.setAttribute('fill', 'none');
    
    svg.appendChild(path);
    
    return svg;
}