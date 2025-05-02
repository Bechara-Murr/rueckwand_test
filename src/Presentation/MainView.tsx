import React from "react";
import MaterialDisplay from "@components/MaterialDisplay";
import "@presentation/MainView.scss";
import CirclePositionsPicker from "@components/CirclePositionsPicker";
import MaterialPicker from "@components/MaterialPicker";
import MeasurementsContextProvider from "@store/MeasurementsContext";

const MainView: React.FC = () => {
  return (
    <MeasurementsContextProvider>
      <section className="main__view">
        <h1>Choose your material</h1>
        <section className="material__picker__container">
          <MaterialDisplay />
          <aside className="material__options__container">
            <MaterialPicker />
            <CirclePositionsPicker />
          </aside>
        </section>
      </section>
    </MeasurementsContextProvider>
  );
};

export default MainView;
