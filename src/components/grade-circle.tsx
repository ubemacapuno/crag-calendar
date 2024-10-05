"use client";

interface GradeCircleProps {
  grade: string;
}

export function GradeCircle({ grade }: GradeCircleProps) {
  const getColorComponents = (grade: string) => {
    const match = grade.match(/V(\d+)([-+])?/);
    let value = 0;
    if (match) {
      value = parseInt(match[1]);
      if (match[2] === "-") value -= 0.5;
      if (match[2] === "+") value += 0.5;
    }

    // Use sine functions to create smooth color transitions
    const frequency = 0.3; // Adjust this to change the rate of color change
    const r = Math.sin(frequency * value + 0) * 127 + 128;
    const g = Math.sin(frequency * value + 2) * 127 + 128;
    const b = Math.sin(frequency * value + 4) * 127 + 128;

    return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
  };

  const { r, g, b } = getColorComponents(grade);
  const backgroundColor = `rgb(${r}, ${g}, ${b})`;

  // Calculate text color based on background brightness
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709
  const textColor = luma < 128 ? "white" : "black";

  return (
    <div
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs"
      style={{
        backgroundColor,
        color: textColor,
      }}
    >
      {grade}
    </div>
  );
}
