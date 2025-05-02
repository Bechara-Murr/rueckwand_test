import React from "react";
import { ICirclePositionPickerProps } from "@model/Measurements.model";
import { MeasurementsContext } from "@store/MeasurementsContext";

const CirclePositionPicker: React.FC<ICirclePositionPickerProps> = ({
  wallSlab,
}) => {
  const measurementsContext = React.useContext(MeasurementsContext);
  const min_height: number = parseInt(
    process.env.REACT_APP_MIN_SLAB_HEIGHT || "0",
    10
  );
  const min_width: number = parseInt(
    process.env.REACT_APP_MIN_SLAB_WIDTH || "0",
    10
  );
  const max_height: number = parseInt(
    process.env.REACT_APP_MAX_SLAB_HEIGHT || "0",
    10
  );
  const max_width: number = parseInt(
    process.env.REACT_APP_MAX_SLAB_WIDTH || "0",
    10
  );

  const onXPositionChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    measurementsContext.updateDraggedSlabCircleXPosition(
      wallSlab.id,
      parseInt(value, 10)
    );
  };

  const onYPositionChanged = (event: React.FormEvent<HTMLInputElement>) => {
    const value = (event.target as HTMLInputElement).value;
    measurementsContext.updateDraggedSlabCircleYPosition(
      wallSlab.id,
      parseInt(value, 10)
    );
  };

  const onXPositionBlurred = () => {
    if (wallSlab.widthCM < min_width) {
      measurementsContext.updateDraggedSlabCircleXPosition(
        wallSlab.id,
        min_width
      );
    }
  };

  const onYPositionBlurred = () => {
    if (wallSlab.heightCM < min_height) {
      measurementsContext.updateDraggedSlabCircleYPosition(
        wallSlab.id,
        min_height
      );
    }
  };

  const onInputFocused = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  return (
    <div className="circle__position__picker">
      <div className="coordinate__input__container">
        <label htmlFor="x_position">
          <span>X position</span>
          <span>
            {min_width} - {max_width}cm
          </span>
        </label>
        <input
          id="x_position"
          type="number"
          value={Math.round(wallSlab.widthCM)}
          onChange={onXPositionChanged}
          onBlur={onXPositionBlurred}
          onFocus={onInputFocused}
        />
      </div>
      <div className="coordinate__input__container">
        <label htmlFor="y_position">
          <span>Y position</span>
          <span>
            {min_height} - {max_height}cm
          </span>
        </label>
        <input
          id="y_position"
          type="number"
          value={Math.round(wallSlab.heightCM)}
          onChange={onYPositionChanged}
          onBlur={onYPositionBlurred}
          onFocus={onInputFocused}
        />
      </div>
    </div>
  );
};

export default CirclePositionPicker;
