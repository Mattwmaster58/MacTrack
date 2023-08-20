import { useNavigate } from "react-router-dom";
import React from "react";

const useAccessibleOnClick = (href: string) => {
  const navigate = useNavigate();
  return {
    href,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      navigate(href);
    },
  };
};

export { useAccessibleOnClick };
