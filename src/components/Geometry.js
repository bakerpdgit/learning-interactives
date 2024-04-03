import React, { useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Circle, Rect, Text } from "react-konva";
import styles from "./Geometry.module.css"; // Ensure this path matches your CSS module file

function Geometry({ text }) {
  const [originalPoints, setOriginalPoints] = useState([]);
  const [scaledPoints, setScaledPoints] = useState([]);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [verticesVisible, setVerticesVisible] = useState(true); // New state for vertex visibility
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [options, setOptions] = useState({ angles: "no" }); // Default option
  const [shapeTypes, setShapeTypes] = useState([]); // 0 for polygon, 1 for circle

  // Modify this function to capture the starting drag position
  const handlePolygonDragStart = (e) => {
    setVerticesVisible(false); // Hide vertices
    setDragStartPos({ x: e.target.x(), y: e.target.y() }); // Capture start position
  };

  // Function to handle vertex removal
  const handleVertexDoubleClick = (polygonIndex, pointIndex) => {
    setOriginalPoints((prev) => {
      // Clone to avoid direct state mutation
      const newPoints = [...prev];

      // Ensure polygon has more than 3 vertices before removing one
      if (newPoints[polygonIndex].length >= 1) {
        newPoints[polygonIndex] = [
          ...newPoints[polygonIndex].slice(0, pointIndex),
          ...newPoints[polygonIndex].slice(pointIndex + 1),
        ];

        scalePointsToFitStage(newPoints);
      }

      return newPoints;
    });
  };

  const handlePolygonDragEnd = (e, polygonIndex) => {
    // Calculate the displacement in scaled coordinates
    const scale = stageSize.width / 1000;
    const displacement = {
      x: (e.target.x() - dragStartPos.x) / scale,
      y: (e.target.y() - dragStartPos.y) / scale,
    };

    // Apply the displacement to the original points
    const updatedOriginalPoints = originalPoints.map((polygon, idx) =>
      idx === polygonIndex
        ? polygon.map((point) => ({
            x: point.x + displacement.x,
            y: point.y + displacement.y,
          }))
        : polygon
    );

    setOriginalPoints(updatedOriginalPoints);

    // Recalculate scaled points from updated original points
    scalePointsToFitStage(updatedOriginalPoints);

    setVerticesVisible(true); // Make vertices visible again

    // Reset the position of the dragged shape to negate Konva's internal drag positioning
    e.target.position({
      x: dragStartPos.x,
      y: dragStartPos.y,
    });
    e.target.getLayer().batchDraw(); // Optimize rendering
  };

  const scalePointsToFitStage = useCallback(
    (points) => {
      const scale = stageSize.width / 1000; // Assuming the original size is 1000x1000
      const scaled = points.map((polygon) =>
        polygon.map((point) => ({
          x: point.x * scale,
          y: point.y * scale,
        }))
      );
      setScaledPoints(scaled);
    },
    [stageSize.width, setScaledPoints]
  );

  useEffect(() => {
    scalePointsToFitStage(originalPoints);
  }, [stageSize, originalPoints, scalePointsToFitStage]);

  function parseShapes(text) {
    const lines = text.split("\n");
    let options = { angles: "no" }; // Default option
    let shapes = []; // Stores both polygons and circles as arrays of points
    let shapeTypes = []; // 0 for polygon, 1 for circle

    lines.forEach((line) => {
      if (line.startsWith("OPTIONS:")) {
        // Parse options as before
        line
          .substring("OPTIONS:".length)
          .split(",")
          .forEach((option) => {
            const [key, value] = option.split("=");
            options[key] = value;
          });
      } else if (line.includes("[")) {
        // Circle
        const cpoints = line
          .match(/\[(.*?)\]/g)
          .map((point) => point.replace(/\[|\]/g, "").split(",").map(Number));
        shapes.push([
          { x: cpoints[0][0], y: cpoints[0][1] },
          { x: cpoints[1][0], y: cpoints[1][1] },
        ]); // Store as two points
        shapeTypes.push(1); // Mark as circle
      } else {
        // Polygon
        const ppoints = line.match(/\((.*?)\)/g)?.map((ppoint) => {
          const [x, y] = ppoint.replace(/\(|\)/g, "").split(",").map(Number);
          return { x, y };
        });
        if (ppoints) {
          shapes.push(ppoints); // Store polygon points normally
          shapeTypes.push(0); // Mark as polygon
        }
      }
    });

    return { options, points: shapes, shapeTypes };
  }

  useEffect(() => {
    const { options: parsedOptions, points, shapeTypes } = parseShapes(text);
    setOptions(parsedOptions);
    setOriginalPoints(points);
    setShapeTypes(shapeTypes);
    updateStageSize(); // This triggers scaling of points
    window.addEventListener("resize", updateStageSize);
    return () => window.removeEventListener("resize", updateStageSize);
  }, [text]);

  function updateStageSize() {
    const size = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
    setStageSize({ width: size, height: size });
  }

  // Example handler for right-click events on shapes
  const handleShapeRightClick = (event, shapeIndex) => {
    event.evt.preventDefault(); // Prevent default context menu

    setOriginalPoints((prevShapes) => {
      // Access the shape directly using shapeIndex
      const shapeToDuplicate = prevShapes[shapeIndex];
      if (!Array.isArray(shapeToDuplicate)) {
        console.error("Expected an array of points, got:", shapeToDuplicate);
        return prevShapes; // Return unchanged if unexpected structure
      }

      // Clone and offset the shape
      const newShape = shapeToDuplicate.map((point) => ({
        x: point.x + 20, // Apply offset
        y: point.y + 20,
      }));

      // Return new array with the duplicated shape added
      return [...prevShapes, newShape];
    });

    // Remember to also update shapeTypes state if necessary
    setShapeTypes((prevTypes) => [...prevTypes, prevTypes[shapeIndex]]);
  };

  // Utility function to calculate distance from a point to a line segment
  function distanceFromPointToLineSegment(px, py, x1, y1, x2, y2) {
    let lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    if (lineLength === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / lineLength ** 2;
    t = Math.max(0, Math.min(1, t));
    let lx = x1 + t * (x2 - x1);
    let ly = y1 + t * (y2 - y1);
    return Math.sqrt((px - lx) ** 2 + (py - ly) ** 2);
  }

  const handleLineDoubleClick = (e, polygonIndex) => {
    const stage = e.target.getStage();
    const pointerPosition = stage.getPointerPosition();
    const scale = stageSize.width / 1000;
    const clickX = pointerPosition.x / scale;
    const clickY = pointerPosition.y / scale;

    const polygon = originalPoints[polygonIndex];
    let closestSegmentIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < polygon.length; i++) {
      const nextIndex = (i + 1) % polygon.length;
      const distance = distanceFromPointToLineSegment(
        clickX,
        clickY,
        polygon[i].x,
        polygon[i].y,
        polygon[nextIndex].x,
        polygon[nextIndex].y
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestSegmentIndex = i;
      }
    }

    // Insert the new point after the closest segment's start point
    const newPoint = { x: clickX, y: clickY };
    const updatedPolygon = [
      ...polygon.slice(0, closestSegmentIndex + 1),
      newPoint,
      ...polygon.slice(closestSegmentIndex + 1),
    ];

    const updatedOriginalPoints = [
      ...originalPoints.slice(0, polygonIndex),
      updatedPolygon,
      ...originalPoints.slice(polygonIndex + 1),
    ];

    setOriginalPoints(updatedOriginalPoints);
    scalePointsToFitStage(updatedOriginalPoints);
  };

  const handleDragEnd = (e, polygonIndex, pointIndex) => {
    const lastKnownGoodPosition = scaledPoints[polygonIndex][pointIndex];
    e.target.position({
      x: lastKnownGoodPosition.x,
      y: lastKnownGoodPosition.y,
    });
    // Force a re-render to ensure the circle's position is updated visually
    // This is typically not necessary as the position change is immediate,
    // but is here if additional state updates or side effects are needed.
  };

  const handleDragMove = (e, polygonIndex, pointIndex) => {
    const scale = stageSize.width / 1000;
    // Calculate proposed new positions before applying them
    const proposedNewX = e.target.x() / scale;
    const proposedNewY = e.target.y() / scale;

    // Check if the proposed new positions fall outside the 1000x1000 area
    if (
      proposedNewX < 20 ||
      proposedNewX > 980 ||
      proposedNewY < 0 ||
      proposedNewY > 980
    ) {
      // If outside the bounds, reject the update and return to leave the point as is
      return;
    }

    // If within bounds, proceed to update the points
    const newScaledPoints = scaledPoints.map((polygon, pIdx) => {
      if (pIdx === polygonIndex) {
        return polygon.map((point, ptIdx) => {
          if (ptIdx === pointIndex) {
            return { x: e.target.x(), y: e.target.y() };
          }
          return point;
        });
      }
      return polygon;
    });
    setScaledPoints(newScaledPoints);

    // Update original points to reflect the change for future resizes
    const newOriginalPoints = newScaledPoints.map((polygon) =>
      polygon.map((point) => ({
        x: (point.x * 1000) / stageSize.width,
        y: (point.y * 1000) / stageSize.height,
      }))
    );
    setOriginalPoints(newOriginalPoints);
  };

  function vectorMagnitude(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
  }

  // Utility function to calculate the dot product of two vectors
  function dotProduct(u, v) {
    return u.x * v.x + u.y * v.y;
  }

  // Function to calculate the angle at a vertex given three points: prev, curr, and next
  function calculateAngle(prev, curr, next) {
    const u = { x: prev.x - curr.x, y: prev.y - curr.y };
    const v = { x: next.x - curr.x, y: next.y - curr.y };

    const dot = dotProduct(u, v);
    const magU = vectorMagnitude(u);
    const magV = vectorMagnitude(v);
    const cosTheta = dot / (magU * magV);

    // Convert to degrees for readability
    return Math.acos(cosTheta) * (180 / Math.PI);
  }

  return (
    <>
      <div>
        <p className={styles.instructions}>
          Right click a line/circle to duplicate it. Double-click a point to
          remove it. Double-click on a line to add a vertex.
        </p>
      </div>
      <div className={styles.GameArea}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
          className={styles.GameArea}
        >
          <Layer>
            {/* Draw a rectangle that matches the size of the Stage to act as a border */}
            <Rect
              x={0}
              y={0}
              width={stageSize.width}
              height={stageSize.height}
              stroke="black" // Color of the border
              strokeWidth={4} // Thickness of the border
            />
            {scaledPoints.map((polygon, polygonIndex) => (
              <React.Fragment key={polygonIndex}>
                {shapeTypes[polygonIndex] === 0 && (
                  // Render polygon logic
                  <Line
                    points={polygon.flatMap((p) => [p.x, p.y])}
                    closed={true}
                    stroke="black"
                    draggable
                    onDragStart={handlePolygonDragStart}
                    onDragEnd={(e) => handlePolygonDragEnd(e, polygonIndex)}
                    onDblClick={(e) => handleLineDoubleClick(e, polygonIndex)}
                    onContextMenu={(e) =>
                      handleShapeRightClick(e, polygonIndex)
                    }
                  />
                )}
                {shapeTypes[polygonIndex] === 1 && (
                  // Render circle
                  <Circle
                    x={polygon[0].x} // Center x
                    y={polygon[0].y} // Center y
                    radius={Math.sqrt(
                      Math.pow(polygon[1].x - polygon[0].x, 2) +
                        Math.pow(polygon[1].y - polygon[0].y, 2)
                    )}
                    stroke="black"
                    strokeWidth={2}
                    onContextMenu={(e) =>
                      handleShapeRightClick(e, polygonIndex)
                    }
                    onDragStart={handlePolygonDragStart}
                    onDragEnd={(e) => handlePolygonDragEnd(e, polygonIndex)}
                  />
                )}
                {polygon.map((point, pointIndex) => (
                  <Circle
                    key={pointIndex}
                    x={point.x}
                    y={point.y}
                    radius={5}
                    fill="red"
                    draggable={verticesVisible}
                    visible={verticesVisible}
                    onDragMove={(e) =>
                      handleDragMove(e, polygonIndex, pointIndex)
                    }
                    onDragEnd={(e) =>
                      handleDragEnd(e, polygonIndex, pointIndex)
                    }
                    onDblClick={() =>
                      handleVertexDoubleClick(polygonIndex, pointIndex)
                    }
                  />
                ))}
                {polygon.length > 2 &&
                  options.angles === "yes" &&
                  polygon.map((point, pointIndex) => {
                    const prev =
                      polygon[
                        (pointIndex - 1 + polygon.length) % polygon.length
                      ];
                    const curr = point;
                    const next = polygon[(pointIndex + 1) % polygon.length];

                    const angle = calculateAngle(prev, curr, next);
                    const angleText = angle.toFixed(1) + "°";

                    // Implementing the bisector method for label positioning
                    if (
                      Math.abs(angle) > 0.5 &&
                      Math.abs(angle - 180.0) > 0.5
                    ) {
                      // Normalize function to calculate unit vectors
                      const normalize = (vector) => {
                        const length = Math.sqrt(
                          vector.x * vector.x + vector.y * vector.y
                        );
                        return { x: vector.x / length, y: vector.y / length };
                      };

                      // Calculate vectors to previous and next points
                      const vectorToPrev = normalize({
                        x: prev.x - curr.x,
                        y: prev.y - curr.y,
                      });
                      const vectorToNext = normalize({
                        x: next.x - curr.x,
                        y: next.y - curr.y,
                      });

                      // Bisector direction
                      const bisector = normalize({
                        x: vectorToPrev.x + vectorToNext.x,
                        y: vectorToPrev.y + vectorToNext.y,
                      });

                      let nudgeDistance = stageSize.width / 35; // Adjust based on your requirements

                      let rotationAngle =
                        Math.atan2(bisector.y, bisector.x) * (180 / Math.PI);

                      if (rotationAngle < -90 || rotationAngle > 90) {
                        rotationAngle += 180; // Flip text upside down if it's facing left
                        nudgeDistance *= 3;
                      }

                      return (
                        <React.Fragment key={pointIndex}>
                          <Text
                            x={curr.x + bisector.x * nudgeDistance}
                            y={curr.y + bisector.y * nudgeDistance}
                            text={angleText}
                            fontSize={12}
                            fill="black"
                            visible={verticesVisible}
                            rotation={rotationAngle}
                          />
                        </React.Fragment>
                      );
                    } else {
                      return null;
                    }
                  })}
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
    </>
  );
}

export default Geometry;
