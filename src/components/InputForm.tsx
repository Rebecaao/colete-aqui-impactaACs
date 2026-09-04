import React from "react";

type InputFormProps = {
  label: string;
  error?: string;
  [key: string]: any;
};

export function InputForm({ label, error, ...props }: InputFormProps) {
  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: "6px",
    border: `1px solid ${error ? "#e74c3c" : "#dcdde1"}`,
    fontSize: "14px",
    outline: "none",
    backgroundColor: props.disabled ? "#f1f2f6" : "#ffffff",
    color: props.disabled ? "#555" : "#000",
    cursor: props.disabled ? "not-allowed" : "text",
  };

  return (
    <div style={{ flex: 1, minWidth: "200px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "5px",
          fontWeight: "600",
          color: "#333",
          fontSize: "13px",
        }}
      >
        {label}
      </label>
      <input style={inputStyle} {...props} />
      {error && (
        <span
          style={{
            color: "#e74c3c",
            fontSize: "12px",
            marginTop: "3px",
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
