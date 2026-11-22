import React, { useState, useEffect, useCallback, useRef } from "react";
import { Stage, Layer, Line, Circle, Text } from "react-konva";
import styles from "./Geometry.module.css"; // Ensure this path matches your CSS module file

function Geometry({ text }) {
  const workspace = useRef(null);
  const [shape, setShape] = useState(0);
  const [vertex, setVertex] = useState(-1);
  const [originalPoints, setOriginalPoints] = useState([]);
  const [scaledPoints, setScaledPoints] = useState([]);
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
  const [verticesVisible, setVerticesVisible] = useState(true); // New state for vertex visibility
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [options, setOptions] = useState({ angles: "no" }); // Default option
  const [shapeTypes, setShapeTypes] = useState([]); // 0 for polygon, 1 for circle
  const [nominalSize, setNominalSize] = useState({ width: 1000, height: 1000 });

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
    const scaleX = stageSize.width / nominalSize.width;
    const scaleY = stageSize.height / nominalSize.height;
    const displacement = {
      x: (e.target.x() - dragStartPos.x) / scaleX,
      y: (e.target.y() - dragStartPos.y) / scaleY,
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
      const scaleX = stageSize.width / nominalSize.width;
      const scaleY = stageSize.height / nominalSize.height;
      const scaled = points.map((polygon) =>
        polygon.map((point) => ({
          x: point.x * scaleX,
          y: point.y * scaleY,
        }))
      );
      setScaledPoints(scaled);
    },
    [stageSize, nominalSize]
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
    const vw = workspace.current.clientWidth;
    const vh = Math.min(vw, 560, Math.max(280, Math.round(window.innerHeight * 0.64)));
    const nominalHeight = 1000; // Fixed nominal height
    const nominalWidth = (vw / vh) * nominalHeight; // Dynamic nominal width based on aspect ratio
    setStageSize({ width: vw, height: vh });
    setNominalSize({ width: nominalWidth, height: nominalHeight });
  }

  // Example handler for right-click events on shapes
  const handleShapeRightClick = (event, shapeIndex) => {
    event.evt.preventDefault();
    duplicateShape(shapeIndex);
  };

  function duplicateShape(shapeIndex) {
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
  }

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
    const scaleX = stageSize.width / nominalSize.width;
    const scaleY = stageSize.height / nominalSize.height;
    const clickX = pointerPosition.x / scaleX;
    const clickY = pointerPosition.y / scaleY;

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

  function findSnappingPoint(endX, endY, polygonIndex, excludedPointIndex) {
    const threshold = 10; // Snapping threshold in pixels
    for (let i = 0; i < scaledPoints.length; i++) {
      for (let j = 0; j < scaledPoints[i].length; j++) {
        if (i === polygonIndex && j === excludedPointIndex) continue; // Skip the point being dragged
        const point = scaledPoints[i][j];
        if (
          Math.abs(point.x - endX) < threshold &&
          Math.abs(point.y - endY) < threshold
        ) {
          return point;
        }
      }
    }
    return null; // No snapping point found
  }

  const handleDragEnd = (e, polygonIndex, pointIndex) => {
    const endX = e.target.x();
    const endY = e.target.y();
    const snappedPoint = findSnappingPoint(
      endX,
      endY,
      polygonIndex,
      pointIndex
    );

    if (snappedPoint) {
      // Calculate the original coordinates for the snapped point
      const originalSnappedX =
        (snappedPoint.x / stageSize.width) * nominalSize.width;
      const originalSnappedY =
        (snappedPoint.y / stageSize.height) * nominalSize.height;

      // Update the original points with the new snapped coordinates
      const updatedOriginalPoints = originalPoints.map((polygon, idx) => {
        if (idx === polygonIndex) {
          return polygon.map((point, idx) => {
            if (idx === pointIndex) {
              return { x: originalSnappedX, y: originalSnappedY };
            }
            return point;
          });
        }
        return polygon;
      });
      setOriginalPoints(updatedOriginalPoints);

      // Scale the updated original points to update the scaled points
      const updatedScaledPoints = updatedOriginalPoints.map((polygon) =>
        polygon.map((point) => ({
          x: (point.x / nominalSize.width) * stageSize.width,
          y: (point.y / nominalSize.height) * stageSize.height,
        }))
      );
      setScaledPoints(updatedScaledPoints);

      // Reset the dragged element to its new position
      e.target.position({
        x: snappedPoint.x,
        y: snappedPoint.y,
      });
    } else {
      // No snap, so revert to the last known good position
      const lastKnownGoodPosition = scaledPoints[polygonIndex][pointIndex];
      e.target.position({
        x: lastKnownGoodPosition.x,
        y: lastKnownGoodPosition.y,
      });
    }
    e.target.getLayer().batchDraw(); // Optimize rendering
  };

  const handleDragMove = (e, polygonIndex, pointIndex) => {
    const scaleX = stageSize.width / nominalSize.width;
    const scaleY = stageSize.height / nominalSize.height;
    // Calculate proposed new positions before applying them
    const proposedNewX = e.target.x() / scaleX;
    const proposedNewY = e.target.y() / scaleY;

    // Check if the proposed new positions fall outside the nominal area
    if (
      proposedNewX < 20 ||
      proposedNewX > nominalSize.width - 20 ||
      proposedNewY < 0 ||
      proposedNewY > nominalSize.height - 20
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
        x: (point.x * nominalSize.width) / stageSize.width,
        y: (point.y * nominalSize.height) / stageSize.height,
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

  const selectedShape = originalPoints[shape];
  const isPolygon = shapeTypes[shape] === 0;

  function nudge(x, y) {
    setOriginalPoints((current) => current.map((points, index) => index !== shape ? points :
      points.map((point, item) => vertex >= 0 && vertex < points.length && vertex !== item ? point : { x: point.x + x, y: point.y + y })));
  }

  function addVertex() {
    setOriginalPoints((current) => current.map((points, index) => {
      if (index !== shape) return points;
      const first = points[vertex];
      const next = points[(vertex + 1) % points.length];
      return [...points.slice(0, vertex + 1), { x: (first.x + next.x) / 2, y: (first.y + next.y) / 2 }, ...points.slice(vertex + 1)];
    }));
    setVertex(vertex + 1);
  }

  return (
    <>
      {selectedShape && <div className={styles.controls}>
        <label>Shape <select value={shape} onChange={(event) => { setShape(Number(event.target.value)); setVertex(-1); }}>
          {originalPoints.map((_, index) => <option key={index} value={index}>
            {shapeTypes[index] === 1 ? "Circle" : "Shape"} {index + 1}
          </option>)}
        </select></label>
        <label>Move <select value={vertex >= selectedShape.length ? -1 : vertex}
          onChange={(event) => setVertex(Number(event.target.value))}>
          <option value={-1}>Whole shape</option>
          {selectedShape.map((_, index) => <option key={index} value={index}>
            {isPolygon ? "Vertex " + (index + 1) : index === 0 ? "Centre" : "Radius handle"}
          </option>)}
        </select></label>
        <div className={styles.actions}>
          {[["left", -20, 0], ["right", 20, 0], ["up", 0, -20], ["down", 0, 20]].map(([name, x, y]) =>
            <button type="button" key={name} onClick={() => nudge(x, y)}>Move {name}</button>)}
          <button type="button" onClick={() => duplicateShape(shape)}>Duplicate shape</button>
          {isPolygon && <>
            <button type="button" disabled={vertex < 0 || vertex >= selectedShape.length || selectedShape.length < 2}
              onClick={addVertex}>Add vertex after selected</button>
            <button type="button" disabled={vertex < 0 || vertex >= selectedShape.length || selectedShape.length < 3}
              onClick={() => { handleVertexDoubleClick(shape, vertex); setVertex(-1); }}>Remove selected vertex</button>
          </>}
        </div>
      </div>}
      <div className={styles.GameArea} ref={workspace}>
        <Stage
          width={stageSize.width}
          height={stageSize.height}
        >
          <Layer>
            {scaledPoints.map((polygon, polygonIndex) => (
              <React.Fragment key={polygonIndex}>
                {shapeTypes[polygonIndex] === 0 && (
                  // Render polygon logic
                  <Line
                    points={polygon.flatMap((p) => [p.x, p.y])}
                    closed={true}
                    stroke="black"
                    onDblClick={(e) => handleLineDoubleClick(e, polygonIndex)}
                    onContextMenu={(e) =>
                      handleShapeRightClick(e, polygonIndex)
                    }
                    draggable
                    onDragStart={handlePolygonDragStart}
                    onDragEnd={(e) => handlePolygonDragEnd(e, polygonIndex)}
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
                    draggable
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

                      let nudgeDistance = stageSize.width / 45; // Adjust based on your requirements

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
          <Layer>
            {scaledPoints.map((polygon, polygonIndex) => (
              <React.Fragment key={`v${polygonIndex}`}>
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
              </React.Fragment>
            ))}
          </Layer>
        </Stage>
      </div>
    </>
  );
}

export default Geometry;
