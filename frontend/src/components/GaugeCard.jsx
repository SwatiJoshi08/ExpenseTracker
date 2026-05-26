import React from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

const GaugeCard = ({
  gauge = {},
  colorInfo = {},
  timeFrameLabel = "",
  highlightNegative = false,
}) => {
  const { name = "Metric", value = 0, max = 100 } = gauge;
  const isNegative = value < 0;
  const absValue = Math.abs(value);

  // For negative values, we'll show the absolute value in the chart but indicate it's negative in text
  //   const chartValue = Math.min(absValue, max); // Cap at max value
  const percentage = Math.min((absValue / max) * 100, 100);

  // Determine colors based on whether value is negative

  const fillColor = isNegative
    ? "#ef4444"
    : colorInfo.gradientStart || colorInfo.main || "#00C49F";
  const textColor = isNegative ? "#dc2626" : "#1f2937";

  const percentColor = isNegative ? "#ef4444" : "#6b7280";

  // Format data for radial bar chart
  const chartData = [
    {
      name,
      value: percentage,
      fill: fillColor,
    },
  ];

  console.debug(`[GaugeCard] "${name}"`, { value, max, percentage, fillColor });

  return (
    <div className="bg-white rounded-xl p-5 -mx-3 lg:-mx-0 md:-mx-5 shadow-sm flex flex-col items-center border border-gray-100">
      <h3 className="text-lg font-semibold mb-4" style={{ color: textColor }}>
        {name}
      </h3>
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            data={chartData}
            cx="50%"
            cy="50%"
            startAngle={180}
            endAngle={0}
            innerRadius="60%"
            outerRadius="80%"
            barSize={20}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              //   angleAxisId={0}
              minAngle={5}
              background={{ fill: "#f3f4f6" }}
              dataKey="value"
              cornerRadius={10}
              isAnimationActive={true}
            />
            <text
              x="50%"
              y="48%"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-2xl font-bold ${textColor}`}
              style={{ fontSize: "24px", fontWeight: "bold", fill: textColor }}
            >
              {isNegative ? "-" : ""}${Math.round(absValue).toLocaleString()}
            </text>
            <text
              x="50%"
              y="62%"
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-sm ${percentColor}`}
              style={{ fontSize: "14px", fill: percentColor }}
            >
              {Math.round(percentage)}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center mt-3">
        {isNegative && highlightNegative && (
          <p className="text-sm text-red-600 font-semibold mb-1">
            Negative savings
          </p>
        )}
        <p className="text-sm text-gray-500">{timeFrameLabel} data</p>
      </div>
    </div>
  );
};

export default GaugeCard;
