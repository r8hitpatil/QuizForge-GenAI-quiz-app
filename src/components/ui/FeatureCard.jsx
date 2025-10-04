import React from "react";
// import { BorderBeam } from "./border-beam";

const FeatureCard = ({ icon, title, description }) => {
	// const randomNum = Math.floor(Math.random() * 20) + 1;
  return (
    <div className="relative text-center p-6 rounded-lg border border-gray-300 hover:shadow-gray-200 hover:shadow-xl transition-shadow font-extended">
      <div>
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 font-belfast">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      {/* <BorderBeam className="from-transparent via-black to-transparent" duration={randomNum} size={100} /> */}
    </div>
  );
};

export default FeatureCard;
