interface ChartData {
  category: string;
  amount: number;
}

export const generatePDFBarChartSVG = (
  data: ChartData[], 
  currencyCode: string, 
  isIncome: boolean = false
): string => {
  if (data.length === 0) return '';

  const maxAmount = Math.max(...data.map(item => item.amount));
  const chartWidth = 500;
  const chartHeight = 300;
  
  // Horizontal bar chart layout
  const leftMargin = 120; // Space for category names
  const rightMargin = 80; // Space for amount labels
  const topMargin = 20;
  const bottomMargin = 20;
  const barHeight = 25; // Height of each bar
  const barSpacing = 15; // Space between bars
  const availableHeight = chartHeight - topMargin - bottomMargin;
  const availableWidth = chartWidth - leftMargin - rightMargin;
  
  // Calculate how many bars we can fit
  const totalBarSpace = data.length * (barHeight + barSpacing) - barSpacing;
  const startY = topMargin + (availableHeight - totalBarSpace) / 2;

  // Color palette for different categories
  const colorPalette = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Purple
    '#85C1E9', // Light Blue
    '#F8C471', // Orange
    '#82E0AA', // Light Green
  ];

  const formatAmount = (amount: number) => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'symbol',
    }).format(Math.abs(amount));
    
    // Put negative sign before the currency symbol
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  };

  const bars = data.map((item, index) => {
    const barWidth = (item.amount / maxAmount) * availableWidth;
    const y = startY + index * (barHeight + barSpacing);
    const x = leftMargin;
    const fillColor = colorPalette[index % colorPalette.length]; // Use different color for each category

    // Truncate category name if too long
    const displayCategory = item.category.length > 15 ? item.category.substring(0, 13) + '...' : item.category;

    return `
      <rect 
        x="${x}" 
        y="${y}" 
        width="${barWidth}" 
        height="${barHeight}" 
        fill="${fillColor}" 
        rx="3"
      />
      <text 
        x="10" 
        y="${y + barHeight / 2 + 4}" 
        text-anchor="start" 
        font-size="11" 
        fill="#666"
        font-family="Arial, sans-serif"
      >
        ${displayCategory}
      </text>
      <text 
        x="${x + barWidth + 10}" 
        y="${y + barHeight / 2 + 4}" 
        text-anchor="start" 
        font-size="10" 
        fill="#333"
        font-weight="bold"
        font-family="Arial, sans-serif"
      >
        ${formatAmount(item.amount)}
      </text>
    `;
  }).join('');

  return `
    <svg width="${chartWidth}" height="${chartHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      ${bars}
    </svg>
  `;
}; 