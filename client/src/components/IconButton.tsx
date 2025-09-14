import React from "react";
import Icon, { IconName } from "./Icon";

type Props = {
  name: IconName;
  onClick?: () => void;
  title?: string;
  className?: string;
  size?: number;
  type?: "button" | "submit" | "reset";
};

export default function IconButton({
  name,
  onClick,
  title,
  className,
  size = 20,
  type = "button",          // <— по умолчанию НЕ submit
}: Props) {
  return (
    <button
      type={type}
      className={`btn icon-btn ${className || ""}`}
      onClick={onClick}
      aria-label={title || name}
    >
      <Icon name={name} size={size} />
    </button>
  );
}
