import React from "react";
import "./BounceCheckBox.scss";
import _ from "lodash";

interface BounceCheckBoxProps {
  cursor?: string;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  className?: string;
  label?: string;
  checked?: boolean;
  onClick?: () => void;
}

const BounceCheckBox: React.FC<BounceCheckBoxProps> = ({
  cursor,
  disabled,
  onChange,
  id,
  name,
  className,
  label,
  checked,
  onClick,
}) => {
  const boxid = id || _.uniqueId();

  return (
    <div className={`BounceCheckBox bounce ${className || ""}`}>
      <input
        id={boxid}
        className={`${disabled ? "disabled" : ""}`}
        name={name}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={onChange || (() => {})}
        onClick={onClick}
        style={{ cursor: cursor || "pointer" }}
      />
      <svg viewBox="0 0 21 21">
        <polyline points="5 10.75 8.5 14.25 16 6"></polyline>
      </svg>
      {label && (
        <label
          htmlFor={boxid}
          className={`${disabled ? "disabled" : ""}`}
          style={{ cursor: cursor || "pointer" }}
          onClick={() => {
            if (!disabled && onClick) {
              onClick();
            }
          }}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default BounceCheckBox;
