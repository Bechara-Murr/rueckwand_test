import React from "react";
import DraggableCircle from "@components/DraggableCircle";
import { MeasurementsContext } from "@store/MeasurementsContext";

interface IMaterialDisplayProps {}
const MaterialDisplay: React.FC<IMaterialDisplayProps> = () => {
  const parentRef = React.useRef<HTMLDivElement | null>(null);
  const measurementsContext = React.useContext(MeasurementsContext);
  const { setImageContainerCoords, selectedMaterial, wallSlabs } =
    measurementsContext;

  const initializeImageContainerCoordinates = React.useCallback(() => {
    const { current: parentElement } = parentRef;
    const parent = parentElement ? parentElement.getBoundingClientRect() : null;
    parent &&
      setImageContainerCoords({
        top: parent.top,
        bottom: parent.bottom,
        left: parent.left,
        right: parent.right,
        height: parent.height,
        width: parent.width,
      });
  }, [parentRef, setImageContainerCoords]);

  React.useEffect(() => {
    initializeImageContainerCoordinates();
    return () => {};
  }, [parentRef, initializeImageContainerCoordinates]);

  return (
    <section className="material__display__container">
      <div className="image__container" ref={parentRef}>
        <img src={selectedMaterial?.image} alt={selectedMaterial?.name} />
        {wallSlabs.map((wallSlab) => (
          <DraggableCircle
            key={wallSlab.id}
            wallSlab={wallSlab}
            parentRef={parentRef}
          />
        ))}
      </div>
    </section>
  );
};

export default MaterialDisplay;
