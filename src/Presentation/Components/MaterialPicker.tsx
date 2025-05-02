import React from "react";
import MaterialCard from "@components/MaterialCard";
import { MeasurementsContext } from "@store/MeasurementsContext";
import { IMaterialCard } from "@model/Measurements.model";

const MaterialPicker: React.FC = () => {
  const itemRefs = React.useRef<Record<number, HTMLDivElement>>({});
  const measurementsContext = React.useContext(MeasurementsContext);

  const onMaterialPick = (ind: number) => {
    let itemsPositions: number[] = [];
    measurementsContext.materials.forEach((item: any, index: number) => {
      const curr = itemRefs.current[index]?.getBoundingClientRect();
      curr && itemsPositions.push(curr.top);
    });
    measurementsContext.setSelectedMaterial(measurementsContext.materials[ind]);
    itemsPositions = itemsPositions.sort();

    measurementsContext.materials.forEach((item: any, index: number) => {
      if (index < ind) {
        if (index + 1 <= measurementsContext.materials.length) {
          let dy = itemsPositions[index + 1] - itemsPositions[index];
          itemRefs.current[index].style.transform = `translateY(${dy}px)`;
        }
      }
      if (ind === index) {
        let dy = itemsPositions[0] - itemsPositions[index];
        itemRefs.current[index].style.transform = `translateY(${dy}px)`;
      }

      if (index > ind) {
        itemRefs.current[index].style.transform = `translateY(0px)`;
      }
    });
  };

  return (
    <div className="material__picker__container">
      <h2>Pick a material</h2>
      {measurementsContext.materials.map(
        (material: IMaterialCard, index: number) => (
          <div
            key={material.id}
            ref={(el: HTMLDivElement) => {
              itemRefs.current[index] = el;
            }}
          >
            <MaterialCard
              el={material}
              index={index}
              onMaterialPick={onMaterialPick}
            />
          </div>
        )
      )}
    </div>
  );
};

export default MaterialPicker;
