import {
  defaultDragInfo,
  IDragInfo,
  IWallMeasurement,
} from "@model/Measurements.model";
import { useCallback, useEffect, useState, useContext } from "react";
import { MeasurementsContext } from "@store/MeasurementsContext";
import React from "react";

type UseDragProps = {
  id: string;
  ref: React.RefObject<HTMLElement | null>;
  pref: React.RefObject<HTMLElement | null>;
  inisitalX: number;
  initialY: number;
};

export const useDrag = ({
  id,
  ref,
  pref,
  inisitalX,
  initialY,
}: UseDragProps): any => {
  const [dragInfo, setDragInfo] = useState<IDragInfo>(defaultDragInfo);
  const [finalPosition, setFinalPosition] = useState<{ x: number; y: number }>({
    x: inisitalX,
    y: initialY,
  });
  const [isDragging, setIsDragging] = useState(false);
  const measurementsContext = useContext(MeasurementsContext);
  const circle_diameter: number = parseInt(
    process.env.REACT_APP_CIRCLE_DIAMETER || "0",
    10
  );
  const calculateFor: string | undefined =
    process.env.REACT_APP_CORNER_REFERENCE;

  // const updatePosition = () => {
  // };

  const checkForCollision = useCallback(
    (
      mouseX: number,
      mouseY: number,
      parentX: number,
      parentY: number
    ): boolean => {
      const circle_radius = Math.ceil(circle_diameter / 2);
      const { top, bottom, left, right, height } =
        measurementsContext.imageContainerCoords;

      // constrain mouse when user drags outside the box
      if (mouseX > right) mouseX = right - circle_radius;
      else if (mouseX < left + measurementsContext.minXYPositions[0])
        mouseX = left + measurementsContext.minXYPositions[0] + circle_radius;

      if (calculateFor === "TOP_LEFT") {
        if (mouseY > bottom) mouseY = bottom - circle_radius;
        else if (mouseY < top + measurementsContext.minXYPositions[1])
          mouseY = top + measurementsContext.minXYPositions[1] + circle_radius;
      } else {
        if (mouseY > top + height - measurementsContext.minXYPositions[1])
          mouseY =
            top +
            height -
            measurementsContext.minXYPositions[1] -
            circle_radius;
        else if (mouseY < top) mouseY = top + circle_radius;
      }

      let isColliding = false;

      measurementsContext.wallSlabs.forEach((slab: IWallMeasurement) => {
        if (slab.id !== id) {
          const slabCenterX = parentX + slab.circleLeftPosition + circle_radius;
          const slabCenterY = parentY + slab.circleTopPosition + circle_radius;
          const dist = calculatePointToPointDistance(
            mouseX + circle_radius,
            mouseY + circle_radius,
            slabCenterX,
            slabCenterY
          );
          if (dist < circle_diameter + 2) isColliding = true;
        }
      });

      return isColliding;
    },
    [
      measurementsContext.wallSlabs,
      measurementsContext.imageContainerCoords,
      id,
      circle_diameter,
      calculateFor,
      measurementsContext.minXYPositions,
    ]
  );

  const updateFinalPosition = useCallback(
    (x: number, y: number) => {
      const { current: parentElement } = pref;
      if (!parentElement) {
        return;
      }

      const parent = parentElement.getBoundingClientRect();
      const isColliding = checkForCollision(x, y, parent.left, parent.top);

      if (!isColliding) {
        if (calculateFor === "BOTTOM_LEFT") {
          setFinalPosition({
            x:
              Math.min(
                Math.max(
                  parent.left + measurementsContext.minXYPositions[0],
                  x
                ),
                parent.right - circle_diameter
              ) - parent.left,
            y:
              Math.max(
                Math.min(
                  parent.top +
                    parent.height -
                    measurementsContext.minXYPositions[1] -
                    circle_diameter,
                  y
                ),
                parent.top
              ) - parent.top,
          });

          return;
        }

        setFinalPosition({
          x:
            Math.min(
              Math.max(parent.left + measurementsContext.minXYPositions[0], x),
              parent.right - circle_diameter
            ) - parent.left,
          y:
            Math.min(
              Math.max(parent.top + measurementsContext.minXYPositions[1], y),
              parent.bottom - circle_diameter
            ) - parent.top,
        });
      }
    },
    [
      calculateFor,
      pref,
      checkForCollision,
      circle_diameter,
      measurementsContext.minXYPositions,
    ]
  );

  const updatePosition = (x: number, y: number) => {
    updateFinalPosition(x, y);
  };
  //   [updateFinalPosition]
  // );

  const handleMouseUp = (evt: MouseEvent) => {
    evt.preventDefault();
    setIsDragging(false);
  };

  const handleMouseDown = (evt: MouseEvent) => {
    evt.preventDefault();

    const { clientX, clientY } = evt;
    const { current: draggableElement } = ref;

    if (!draggableElement) {
      return;
    }

    const { top, left, width, height } =
      draggableElement.getBoundingClientRect();
    setIsDragging(true);
    setDragInfo({
      startX: clientX,
      startY: clientY,
      top,
      left,
      width,
      height,
    });
  };

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      const { current: draggableElement } = ref;
      if (!isDragging || !draggableElement) return;

      evt.preventDefault();

      const { clientX, clientY } = evt;
      const position = {
        x: dragInfo.startX - clientX,
        y: dragInfo.startY - clientY,
      };

      const { top, left } = dragInfo;

      updateFinalPosition(left - position.x, top - position.y);
    },
    [isDragging, dragInfo, ref, updateFinalPosition]
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove]);

  const calculatePointToPointDistance = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number => {
    return Math.hypot(x1 - x2, y1 - y2);
  };

  return {
    position: finalPosition,
    handleMouseDown,
    updatePosition,
    isDragging,
  };
};
