import React from "react";
import { MeasurementsContext } from "@store/MeasurementsContext";

const MaterialCard: React.FC<any> = ({ el, index, onMaterialPick }) => {
  const measurementsContext = React.useContext(MeasurementsContext);
  return (
    <div
      className={`material__card ${
        measurementsContext.selectedMaterial?.id === el.id ? "active" : ""
      }`}
      onClick={() => {
        onMaterialPick(index);
      }}
    >
      <img src={el.image} alt="mosaic" />
      <div>{el.name}</div>
      <div>{index}</div>
    </div>
  );
};

export default MaterialCard;
