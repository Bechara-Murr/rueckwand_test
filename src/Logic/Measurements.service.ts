import {
  IWallMeasurement,
  defaultWallMeasurement,
  IMaterialCard,
} from "@model/Measurements.model";
import { v4 as uuidv4 } from "uuid";
import steel from "@assets/steel.jpeg";
import mosaic from "@assets/mosaic.jpg";
import stone from "@assets/stone.jpeg";
import wood from "@assets/wood.jpg";
import woven from "@assets/woven.jpg.webp";

export default class MeasurementsService {
  max_width: number = parseInt(process.env.REACT_APP_MAX_SLAB_WIDTH || "0", 10);
  max_height: number = parseInt(
    process.env.REACT_APP_MAX_SLAB_HEIGHT || "0",
    10
  );
  min_width: number = parseInt(process.env.REACT_APP_MIN_SLAB_WIDTH || "0", 10);
  min_height: number = parseInt(
    process.env.REACT_APP_MIN_SLAB_HEIGHT || "0",
    10
  );
  circle_diameter: number = parseInt(
    process.env.REACT_APP_CIRCLE_DIAMETER || "0",
    10
  );
  calculateFor: string | undefined = process.env.REACT_APP_CORNER_REFERENCE;
  isTopLeft: boolean = this.calculateFor === "TOP_LEFT" ? true : false;

  initializeWallSlabs(
    parentWidth: number,
    parentHeight: number,
    minXY: [number, number]
  ): IWallMeasurement[] {
    const xPerc = (minXY[0] * 100) / parentWidth;
    const yPerc = (minXY[1] * 100) / parentHeight;
    const xCM = (minXY[0] * parentWidth) / this.max_width;
    const yCM = (minXY[1] * parentHeight) / this.max_height;

    return [
      {
        ...defaultWallMeasurement,
        id: uuidv4(),
        circleLeftPosition: minXY[0],
        circleTopPosition: this.isTopLeft
          ? minXY[1]
          : parentHeight - minXY[1] - this.circle_diameter,
        widthPerc: xPerc,
        heightPerc: yPerc,
        widthCM: xCM,
        heightCM: yCM,
      },
    ];
  }

  calculateMinXYPositions(
    parentWidth: number,
    parentHeight: number
  ): [number, number] {
    const x: number = (this.min_width * parentWidth) / this.max_width;
    const y: number = (this.min_height * parentHeight) / this.max_height;

    return [x, y];
  }

  addNewWallSlab(
    existingWallSlabs: IWallMeasurement[],
    parentWidth: number,
    parentHeight: number,
    minXYPositions: [number, number]
  ): IWallMeasurement[] {
    let adjustedX: number = minXYPositions[0];
    let adjustedY: number = this.isTopLeft
      ? minXYPositions[1]
      : parentHeight - minXYPositions[1] - this.circle_diameter;

    let overlapping: boolean = true;

    // If there's overlap, adjust position by moving the circle
    while (overlapping) {
      const hasOverlap: boolean = this.checkOverlap(
        existingWallSlabs,
        adjustedX,
        adjustedY
      );
      if (hasOverlap) {
        adjustedX += this.circle_diameter + 1;

        // If can no longer add circles on current row, should go to a new row
        if (adjustedX + this.circle_diameter > parentWidth) {
          adjustedX = minXYPositions[0];
          adjustedY = this.isTopLeft
            ? adjustedY + this.circle_diameter + 1
            : adjustedY - 1;
        }

        // if at the end even the height is surpassed,
        // do not add a new circle and return current ones
        if (this.isTopLeft) {
          if (adjustedY + this.circle_diameter > parentHeight) {
            return [...existingWallSlabs];
          }
        } else {
          if (adjustedY < 0) {
            return [...existingWallSlabs];
          }
        }
      } else {
        overlapping = false;
      }
    }

    const xPerc = (adjustedX * 100) / parentWidth;
    const xCM = (adjustedX * parentWidth) / this.max_width;
    const yPerc = this.isTopLeft
      ? (adjustedY * 100) / parentHeight
      : ((parentHeight - adjustedY - this.circle_diameter) * 100) /
        parentHeight;
    const yCM = this.isTopLeft
      ? (adjustedY * parentHeight) / this.max_height
      : ((parentHeight - adjustedY - this.circle_diameter) * this.max_height) /
        parentHeight;

    const newCircle = {
      id: uuidv4(),
      circleLeftPosition: adjustedX,
      circleTopPosition: adjustedY,
      widthPerc: xPerc,
      heightPerc: yPerc,
      widthCM: xCM,
      heightCM: yCM,
    };

    return [...existingWallSlabs, newCircle];
  }

  checkOverlap(
    existingWallSlabs: IWallMeasurement[],
    newX: number,
    newY: number
  ): boolean {
    return existingWallSlabs.some((circle) => {
      const distance: number = Math.sqrt(
        Math.pow(circle.circleLeftPosition - newX, 2) +
          Math.pow(circle.circleTopPosition - newY, 2)
      );

      return distance <= this.circle_diameter;
    });
  }

  /**
   * returns an array with a list of 5 materials
   * can be replaced by an api call
   */
  initializeMaterials(): IMaterialCard[] {
    return [
      {
        id: uuidv4(),
        name: "Steel",
        features: ["Feature 1", "Feature 2"],
        tag: "Robust und gunstig",
        tagColor: "blue",
        image: steel,
      },
      {
        id: uuidv4(),
        name: "Mosaic",
        features: ["Feature 1", "Feature 2"],
        tag: null,
        tagColor: null,
        image: mosaic,
      },
      {
        id: uuidv4(),
        name: "Stone",
        features: ["Feature 1", "Feature 2"],
        tag: "Bestseller",
        tagColor: "red",
        image: stone,
      },
      {
        id: uuidv4(),
        name: "Wood",
        features: ["Feature 1", "Feature 2"],
        tag: null,
        tagColor: null,
        image: wood,
      },
      {
        id: uuidv4(),
        name: "Woven",
        features: ["Feature 1", "Feature 2"],
        tag: null,
        tagColor: null,
        image: woven,
      },
    ];
  }

  /**
   * When user drags a circle, on release,
   * this will recalculate the circle's values (percentage, CM value and pixel)
   */
  updateDraggedCirclePosition(
    existingWallSlabs: IWallMeasurement[],
    id: string,
    x: number,
    y: number,
    parentHeight: number,
    parentWidth: number
  ): IWallMeasurement[] {
    let relativeLeft = (x / parentWidth) * 100;

    if (x + this.circle_diameter >= parentWidth) {
      relativeLeft = 100;
    }

    const xPerc = Math.min(Math.max(0, relativeLeft), 100);
    const xCM = (xPerc * this.max_width) / 100;

    let yPerc = (y * 100) / parentHeight;
    let yCM = (y * parentHeight) / this.max_height;

    if (!this.isTopLeft) {
      yPerc = ((parentHeight - y - this.circle_diameter) * 100) / parentHeight;
      yCM =
        ((parentHeight - y - this.circle_diameter) * this.max_height) /
        parentHeight;
      if (!this.isTopLeft && y === 0) {
        yPerc = 100;
        yCM = this.max_height;
      }
    }

    existingWallSlabs.forEach((slab: IWallMeasurement) => {
      if (slab.id === id) {
        slab.circleLeftPosition = x;
        slab.circleTopPosition = y;
        slab.widthPerc = xPerc;
        slab.heightPerc = yPerc;
        slab.widthCM = xCM;
        slab.heightCM = yCM;
      }
    });

    return existingWallSlabs;
  }

  /**
   * When user enters a value inside the input
   * it will update all coordinates (position in CM, position percentage, and in pixels)
   * it will also check whether this value collides with any other circles and adjusts
   * the position in such a way that it stays inside the box and does not collide with other circles
   */
  updateDraggedCircleXPosition(
    existingWallSlabs: IWallMeasurement[],
    id: string,
    x: number,
    parentWidth: number,
    parentHeight: number
  ): IWallMeasurement[] {
    const currentSlab = existingWallSlabs.find(
      (slab: IWallMeasurement) => slab.id === id
    );

    if (x > this.max_width) x = this.max_width;
    let xPerc = (x * 100) / this.max_width;
    let xValue = (xPerc * parentWidth) / 100;

    const finalPosition = this.handleCollision(
      existingWallSlabs,
      id,
      xValue,
      currentSlab!.circleTopPosition,
      parentWidth,
      parentHeight
    );

    xPerc = Math.min(Math.max(0, (finalPosition[0] / parentWidth) * 100), 100);
    x = (xPerc * this.max_width) / 100;
    const yPerc = Math.min(
      Math.max(0, (finalPosition[1] / parentHeight) * 100),
      100
    );
    const y = (yPerc * this.max_height) / 100;

    existingWallSlabs.forEach((slab: IWallMeasurement) => {
      if (slab.id === id) {
        slab.widthPerc = xPerc;
        slab.circleLeftPosition = finalPosition[0];
        slab.widthCM = x;
        slab.heightPerc = yPerc;
        slab.circleTopPosition = finalPosition[1];
        slab.heightCM = y;
      }
    });

    return existingWallSlabs;
  }

  /**
   * When user enters a value inside the input
   * it will update all coordinates (position in CM, position percentage, and in pixels)
   * it will also check whether this value collides with any other circles and adjusts
   * the position in such a way that it stays inside the box and does not collide with other circles
   */
  updateDraggedCircleYPosition(
    existingWallSlabs: IWallMeasurement[],
    id: string,
    y: number,
    parentWidth: number,
    parentHeight: number
  ): IWallMeasurement[] {
    const currentSlab = existingWallSlabs.find(
      (slab: IWallMeasurement) => slab.id === id
    );

    if (y > this.max_height) y = this.max_height;

    let yPerc = (y * 100) / this.max_height;
    let yValue = this.calculateYValue(yPerc, parentHeight);

    const finalPosition = this.handleCollision(
      existingWallSlabs,
      id,
      currentSlab!.circleLeftPosition,
      yValue,
      parentWidth,
      parentHeight
    );

    const xPerc = Math.min(
      Math.max(0, (finalPosition[0] / parentWidth) * 100),
      100
    );
    const x = (xPerc * this.max_width) / 100;
    yPerc = this.isTopLeft
      ? Math.min(Math.max(0, (finalPosition[1] / parentHeight) * 100), 100)
      : Math.min(
          Math.max(0, ((parentHeight - finalPosition[1]) / parentHeight) * 100),
          100
        );

    y = (yPerc * this.max_height) / 100;
    yValue = finalPosition[1];

    existingWallSlabs.forEach((slab: IWallMeasurement) => {
      if (slab.id === id) {
        slab.widthPerc = xPerc;
        slab.circleLeftPosition = finalPosition[0];
        slab.widthCM = x;
        slab.circleTopPosition = yValue;
        slab.heightPerc = yPerc;
        slab.heightCM = y;
      }
    });

    return existingWallSlabs;
  }

  calculateYValue(yPerc: number, parentHeight: number): number {
    if (this.isTopLeft) {
      return (yPerc * parentHeight) / 100;
    } else {
      return parentHeight - (yPerc * parentHeight) / 100;
    }
  }

  /**
   * Keeps checking if current slab collides with any other slab
   * if yes it adjusts its coordinates, in such a way it doesn't collide
   * with any other slab, and is always inside the boxe's boundaries
   */
  handleCollision(
    existingWallSlabs: IWallMeasurement[],
    id: string,
    newLeftPosition: number,
    newTopPosition: number,
    parentWidth: number,
    parentHeight: number
  ): [number, number] {
    let xPosition = newLeftPosition;
    let yPosition = newTopPosition;
    while (
      this.checkForCollision(
        existingWallSlabs,
        id,
        xPosition,
        yPosition,
        parentWidth,
        parentHeight
      )
    ) {
      xPosition + this.circle_diameter + 2 > parentWidth
        ? (xPosition -= this.circle_diameter + 2)
        : (xPosition += this.circle_diameter + 2);

      if (this.isTopLeft) {
        yPosition + this.circle_diameter + 2 > parentHeight
          ? (yPosition -= this.circle_diameter + 2)
          : (yPosition += this.circle_diameter + 2);
      } else {
        yPosition - this.circle_diameter - 2 < 0
          ? (yPosition += this.circle_diameter + 2)
          : (yPosition -= this.circle_diameter - 2);
      }
    }
    return [xPosition, yPosition];
  }

  /**
   *
   * Checks if given circle coordinates will collide
   * with any other one
   */
  checkForCollision(
    existingWallSlabs: IWallMeasurement[],
    id: string,
    newLeftPosition: number,
    newTopPosition: number,
    parentWidth: number,
    parentHeight: number
  ): boolean {
    let isColliding = false;
    const circle_radius = Math.ceil(this.circle_diameter / 2);
    existingWallSlabs.forEach((slab: IWallMeasurement) => {
      if (slab.id !== id) {
        const slabCenterX = slab.circleLeftPosition + circle_radius;
        const slabCenterY = slab.circleTopPosition + circle_radius;
        const pointToPointDistance = this.calculatePointToPointDistance(
          newLeftPosition + circle_radius,
          newTopPosition + circle_radius,
          slabCenterX,
          slabCenterY
        );

        if (pointToPointDistance < this.circle_diameter + 2) {
          isColliding = true;
          return;
        }
      }
    });
    return isColliding;
  }

  /**
   *
   * calculate the distance between 2 points
   */
  calculatePointToPointDistance(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    return Math.hypot(x1 - x2, y1 - y2);
  }
}
