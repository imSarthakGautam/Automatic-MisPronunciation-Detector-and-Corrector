import React from "react";

const SubmitButton = ({
  onSubmit,
  disabled = false,
  isLoading = false,
  label = "Submit Audio",
}) => {
  return (
    <button
      onClick={onSubmit}
      disabled={disabled || isLoading}
      className={`w-full bg-[#73A1B2] text-white px-4 py-2 rounded-lg hover:bg-teal-600 focus:outline-none ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {isLoading ? "Submitting..." : label}
    </button>
  );
};

export default SubmitButton;
