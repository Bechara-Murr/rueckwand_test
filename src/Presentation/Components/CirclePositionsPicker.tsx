import React from "react";
import CirclePositionPicker from "@components/CirclePositionPicker";
import { MeasurementsContext } from "@store/MeasurementsContext";

const CirclePositionsPicker: React.FC = () => {
  const measurementsContext = React.useContext(MeasurementsContext);
  const max_number_circles = parseInt(
    process.env.REACT_APP_MAX_NUMBER_CIRCLES || "0",
    10
  );

  const onSubmit = () => {
    console.log(`The Selected Material is: ${"s"}`);
    console.table(measurementsContext.wallSlabs);
  };

  return (
    <div className="circle__positions__container">
      <h2>Pick positions</h2>
      <button
        className="add__new__button"
        onClick={() =>
          measurementsContext.wallSlabs.length < max_number_circles &&
          measurementsContext.addNewWallSlab()
        }
        disabled={measurementsContext.wallSlabs.length >= max_number_circles}
      >
        Add New Circle
      </button>
      <div className="circle__positions__inputs__container">
        {measurementsContext.wallSlabs.map((wallSlab) => (
          <CirclePositionPicker key={wallSlab.id} wallSlab={wallSlab} />
        ))}
      </div>

      <button
        className="submit__button"
        onClick={onSubmit}
        disabled={measurementsContext.wallSlabs.length >= max_number_circles}
      >
        Submit
      </button>
    </div>
  );
};

export default CirclePositionsPicker;
