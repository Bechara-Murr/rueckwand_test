import React from "react";
import {
  IMeasurementsContextProviderProps,
  IMeasurementsContextProps,
  IWallMeasurement,
  IMaterialCard,
  IImageContainer,
  defaultImageContainerCoords,
} from "@model/Measurements.model";
import MeasurementsService from "@logic/Measurements.service";

export const MeasurementsContext =
  React.createContext<IMeasurementsContextProps>({
    wallSlabs: [],
    addNewWallSlab: () => {},
    materials: [],
    selectedMaterial: null,
    setSelectedMaterial: (material: IMaterialCard | null) => {},
    updateDraggedSlabCirclePosition: (id: string, x: number, y: number) => {},
    updateDraggedSlabCircleXPosition: (id: string, x: number) => {},
    updateDraggedSlabCircleYPosition: (id: string, y: number) => {},
    imageContainerCoords: defaultImageContainerCoords,
    setImageContainerCoords: (imageContainerCoords: IImageContainer) => {},
    minXYPositions: [0, 0],
  });

const MeasurementsContextProvider: React.FC<
  IMeasurementsContextProviderProps
> = ({ children }) => {
  const measurementsService = React.useMemo(
    () => new MeasurementsService(),
    []
  );
  const [selectedMaterial, setSelectedMaterial] =
    React.useState<IMaterialCard | null>(null);
  const [materials] = React.useState<IMaterialCard[]>(
    measurementsService.initializeMaterials()
  );
  const [imageContainerCoords, setImageContainerCoords] =
    React.useState<IImageContainer>(defaultImageContainerCoords);
  const [wallSlabs, setWallSlabs] = React.useState<IWallMeasurement[]>([]);
  const [minXYPositions, setMinXYPositions] = React.useState<[number, number]>([
    0, 0,
  ]);

  React.useEffect(() => {
    if (materials.length && selectedMaterial === null) {
      setSelectedMaterial(materials[0]);
    }
  }, [materials, selectedMaterial]);

  React.useEffect(() => {
    if (
      wallSlabs.length === 0 &&
      JSON.stringify(imageContainerCoords) !==
        JSON.stringify(defaultImageContainerCoords)
    ) {
      const minXY = measurementsService.calculateMinXYPositions(
        imageContainerCoords.width,
        imageContainerCoords.height
      );

      setWallSlabs([
        ...measurementsService.initializeWallSlabs(
          imageContainerCoords.width,
          imageContainerCoords.height,
          minXY
        ),
      ]);

      setMinXYPositions(minXY);
    }
  }, [imageContainerCoords, measurementsService, wallSlabs.length]);

  const addNewWallSlab = () => {
    setWallSlabs([
      ...measurementsService.addNewWallSlab(
        wallSlabs,
        imageContainerCoords.width,
        imageContainerCoords.height,
        minXYPositions
      ),
    ]);
  };

  const updateDraggedSlabCirclePosition = (
    id: string,
    x: number,
    y: number
  ) => {
    setWallSlabs([
      ...measurementsService.updateDraggedCirclePosition(
        wallSlabs,
        id,
        x,
        y,
        imageContainerCoords.height,
        imageContainerCoords.width
      ),
    ]);
  };

  const updateDraggedSlabCircleXPosition = (id: string, x: number) => {
    const ws = [
      ...measurementsService.updateDraggedCircleXPosition(
        wallSlabs,
        id,
        x,
        imageContainerCoords.width,
        imageContainerCoords.height
      ),
    ];
    setWallSlabs(ws);
  };
  const updateDraggedSlabCircleYPosition = (id: string, y: number) => {
    const ws = [
      ...measurementsService.updateDraggedCircleYPosition(
        wallSlabs,
        id,
        y,
        imageContainerCoords.width,
        imageContainerCoords.height
      ),
    ];
    setWallSlabs(ws);
  };

  return (
    <MeasurementsContext.Provider
      value={{
        wallSlabs,
        addNewWallSlab,
        materials,
        selectedMaterial,
        setSelectedMaterial,
        updateDraggedSlabCirclePosition,
        updateDraggedSlabCircleXPosition,
        updateDraggedSlabCircleYPosition,
        imageContainerCoords,
        setImageContainerCoords,
        minXYPositions,
      }}
    >
      {children}
    </MeasurementsContext.Provider>
  );
};

export default MeasurementsContextProvider;
