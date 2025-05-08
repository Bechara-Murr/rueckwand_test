import { IWallMeasurement } from "@model/Measurements.model";
import { useCallback, useEffect, useState } from "react";

type UseDragProps = {
    id: string;
    ref: React.RefObject<HTMLElement | null>;
    pref: React.RefObject<HTMLElement | null>;
    calculateFor?: "topLeft" | "center" | "bottomRight"; // Example options
    existingWallSlabs: IWallMeasurement[];
  };
  

export const useDrag = ({ id, ref, pref, calculateFor = "topLeft", existingWallSlabs }: UseDragProps) : any => {
  const [dragInfo, setDragInfo] = useState<any>();
  const [finalPosition, setFinalPosition] = useState({x:-1000, y:-1000});
  const [isDragging, setIsDragging] = useState(false);

  const updateFinalPosition = useCallback(
    (width: number, height: number, x: number, y: number) => {

        const { current: parentElement } = pref;
        if (!parentElement) {
          return;
        }
    
        const parent = parentElement.getBoundingClientRect();

      if (calculateFor === "bottomRight") {
        setFinalPosition({
          x: Math.max(
            Math.min(
                parent.width - width,
              parent.width - (x + width)
            ),
            0
          ),
          y: Math.max(
            Math.min(
              parent.height - height,
              parent.height - (y + height)
            ),
            0
          )
        });

        return;
      }

      setFinalPosition({
        x: Math.min(Math.max(parent.left, x), parent.right - 15) - parent.left ,
        y: Math.min(Math.max(parent.top, y), parent.bottom -15) - parent.top
      });
    },
    [calculateFor]
  );

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

    const {
      top,
      left,
      width,
      height
    } = draggableElement.getBoundingClientRect();
    
    setIsDragging(true);
    setDragInfo({
      startX: clientX,
      startY: clientY,
      top,
      left,
      width,
      height
    });
  };

  const handleMouseMove = useCallback(
    (evt: MouseEvent) => {
      const { current: draggableElement } = ref;
      const { current: parentElement } = pref;

      if (!isDragging || !draggableElement) return;

      evt.preventDefault();

      const { clientX, clientY } = evt;
      const position = {
        x: dragInfo.startX - clientX,
        y: dragInfo.startY - clientY
      };

      const { top, left, width, height } = dragInfo;

      const dragged = draggableElement.getBoundingClientRect();
      const parent = parentElement!.getBoundingClientRect();
      
      const [isColliding, circlesOnDragLine, closestCircle, closestCircleDistance]: [boolean, boolean, IWallMeasurement | null, number] = checkForCollision(clientX, clientY, dragged.left, dragged.top, parent.left, parent.top);

      (!isColliding && !circlesOnDragLine) && updateFinalPosition(width, height, left - position.x, top - position.y);

      // console.log({circlesOnDragLine}, {closestCircle});
      
      if(circlesOnDragLine && closestCircle && closestCircleDistance > 16){
        // Should update here in such a way that the 2 circles collide on the drag line
        // updateFinalPosition(width, height, left - position.x, top - position.y);
        const slabCenterX = parent.left + closestCircle.circleLeftPosition + 8;
        const slabCenterY = parent.top + closestCircle.circleTopPosition + 8;
        const radius = 8; // if diameter = 16

        const collisionPoint = calculateCollisionPoint(
          dragInfo.startX, dragInfo.startY,
          slabCenterX, slabCenterY,
          radius
        );

        updateFinalPosition(
          dragInfo.width,
          dragInfo.height,
          collisionPoint.x - radius,
          collisionPoint.y - radius
        );
      }
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

  const updatePosition = (x: number, y: number) => {
    setFinalPosition({x: x, y: y})
  }

  const checkForCollision = (mouseX: number, mouseY: number, draggedCircleX: number, draggedCircleY: number, parentX:number, parentY:number): [boolean, boolean, IWallMeasurement | null, number] => {

    let closestCircle: IWallMeasurement | null = null;
    let closestCircleDistance: number = Infinity;
    let isColliding = false;
    let circlesOnDragLine = false;
    existingWallSlabs.forEach((slab:IWallMeasurement) => {
      if(slab.id !== id){
        const slabCenterX = parentX + slab.circleLeftPosition + 8;
        const slabCenterY = parentY + slab.circleTopPosition + 8;
        const draggedCircleCenterX = draggedCircleX + 8;
        const draggedCircleCenterY = draggedCircleY + 8;

        const pointToPointDistance = calculatePointToPointDistance(draggedCircleCenterX, draggedCircleCenterY, slabCenterX, slabCenterY);

        if(pointToPointDistance < 16) {
          // const nextmouseToPointDistance = calculatePointToPointDistance(mouseX, mouseY, slabCenterX, slabCenterY);
          if(calculatePointToPointDistance(mouseX, mouseY, slabCenterX, slabCenterY) < 16)
            isColliding = true;
        };

        if(isBetween(draggedCircleCenterX, draggedCircleCenterY, mouseX, mouseY, slabCenterX, slabCenterY) && !isColliding){
          const pointToDragLineDistance = calculatePointToLineDistance(mouseX, mouseY, draggedCircleCenterX, draggedCircleCenterY, slabCenterX, slabCenterY);
          // console.log({pointToDragLineDistance});
          
          if(pointToDragLineDistance < 16){
            // console.log("too close");
            closestCircle = slab;
            closestCircleDistance = pointToPointDistance;
            circlesOnDragLine = true;
          }
        }
      }
    });
    return [isColliding, circlesOnDragLine, closestCircle, closestCircleDistance];
  }

  function calculateCollisionPoint(
    dragStartX: number,
    dragStartY: number,
    targetX: number,
    targetY: number,
    radius: number
  ) {
    const dx = dragStartX - targetX;
    const dy = dragStartY - targetY;
    const length = Math.hypot(dx, dy);
  
    if (length === 0) {
      // Avoid division by zero — fallback to no movement
      return { x: targetX, y: targetY };
    }
  
    // Normalize vector from target toward drag start
    const unitX = dx / length;
    const unitY = dy / length;
  
    // Move outward from the target to simulate touching (without overlap)
    return {
      x: targetX + unitX * radius * 2,
      y: targetY + unitY * radius * 2
    };
  }

  const calculatePointToPointDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.hypot(x1 - x2, y1 - y2)
  }

  const isBetween = (x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    margin: number = 8
  ): boolean => {
    const minX = Math.min(x1, x2) - margin;
    const maxX = Math.max(x1, x2) + margin;
    const minY = Math.min(y1, y2) - margin;
    const maxY = Math.max(y1, y2) + margin;
    return (x3 >= minX && x3 <= maxX) && (y3 >= minY && y3 <= maxY);
  }

  function calculatePointToLineDistance(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    const numerator = Math.abs((x2 - x1) * (y1 - y3) - (x1 - x3) * (y2 - y1));
    const denominator = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    return numerator / denominator;
  }

  return {
    position: finalPosition,
    handleMouseDown,
    updatePosition,
    isDragging
  };
};