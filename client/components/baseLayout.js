import React from "react";
import Header from "./header";

const BaseLayout = ({ children, currentUser }) => {
  return (
    <div>
      <Header currentUser={currentUser} />
      {children}
    </div>
  );
};

export default BaseLayout;
