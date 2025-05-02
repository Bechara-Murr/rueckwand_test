import React from "react";

export type nullableString = string | null;

export interface IMeasurementsContextProviderProps {
  children: React.ReactNode;
}

export interface IMeasurementsContextProps {
  wallSlabs: IWallMeasurement[];
  addNewWallSlab: () => void;
  materials: IMaterialCard[];
  selectedMaterial: IMaterialCard | null;
  setSelectedMaterial: (material: IMaterialCard | null) => void;
  updateDraggedSlabCirclePosition: (id: string, x: number, y: number) => void;
  updateDraggedSlabCircleXPosition: (id: string, x: number) => void;
  updateDraggedSlabCircleYPosition: (id: string, y: number) => void;
  imageContainerCoords: IImageContainer;
  setImageContainerCoords: (imageContainerProps: IImageContainer) => void;
  minXYPositions: [number, number];
}

export interface IWallMeasurement {
  id: string;
  widthCM: number;
  heightCM: number;
  widthPerc: number;
  heightPerc: number;
  circleLeftPosition: number;
  circleTopPosition: number;
}

export const defaultWallMeasurement: IWallMeasurement = {
  id: "",
  widthCM: 0,
  heightCM: 0,
  widthPerc: 0,
  heightPerc: 0,
  circleLeftPosition: 0,
  circleTopPosition: 0,
};

export interface ICirclePositionPickerProps {
  wallSlab: IWallMeasurement;
}

export interface IMaterialCard {
  id: string;
  name: string;
  features: string[];
  tag: nullableString;
  tagColor: nullableString;
  image: string;
}

export interface IImageContainer {
  top: number;
  bottom: number;
  left: number;
  right: number;
  height: number;
  width: number;
}

export const defaultImageContainerCoords = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  height: 0,
  width: 0,
};

export interface ICiclreProps {
  wallSlab: IWallMeasurement;
  parentRef: React.RefObject<HTMLDivElement | null>;
}

export interface IDragInfo {
  startX: number;
  startY: number;
  top: number;
  left: number;
  width: number;
  height: number;
}

export const defaultDragInfo: IDragInfo = {
  startX: 0,
  startY: 0,
  top: 0,
  left: 0,
  width: 0,
  height: 0,
};
