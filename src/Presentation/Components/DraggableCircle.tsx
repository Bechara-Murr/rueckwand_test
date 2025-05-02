import React from "react";
import { useDrag } from "@logic/useDrag";
import { MeasurementsContext } from "@store/MeasurementsContext";
import { ICiclreProps } from "@model/Measurements.model";

const DraggableCircle: React.FC<ICiclreProps> = ({ wallSlab, parentRef }) => {
  const draggableRef = React.useRef<HTMLDivElement | null>(null);
  const measurementsContext = React.useContext(MeasurementsContext);
  const { imageContainerCoords, updateDraggedSlabCirclePosition } =
    measurementsContext;
  const { position, handleMouseDown, updatePosition, isDragging } = useDrag({
    id: wallSlab.id,
    ref: draggableRef,
    pref: parentRef,
    inisitalX: wallSlab.circleLeftPosition,
    initialY: wallSlab.circleTopPosition,
  });
  const circle_diameter: number = parseInt(
    process.env.REACT_APP_CIRCLE_DIAMETER || "0",
    10
  );

  React.useEffect(() => {
    updatePosition(
      wallSlab.circleLeftPosition + imageContainerCoords.left,
      wallSlab.circleTopPosition + imageContainerCoords.top
    );
  }, [
    wallSlab.circleLeftPosition,
    wallSlab.circleTopPosition,
    imageContainerCoords.left,
    imageContainerCoords.top,
  ]);

  React.useEffect(() => {
    if (!isDragging && position.x >= 0 && position.y >= 0) {
      updateDraggedSlabCirclePosition(wallSlab.id, position.x, position.y);
    }
  }, [isDragging, imageContainerCoords, position.x, position.y, wallSlab.id]);

  return (
    <div
      className="circle"
      ref={draggableRef}
      style={{
        width: circle_diameter,
        height: circle_diameter,
        top: position.y,
        left: position.x,
      }}
      onMouseDown={handleMouseDown}
    ></div>
  );
};

export default DraggableCircle;
