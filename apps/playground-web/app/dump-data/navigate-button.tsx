"use client";

export default function NavigateButton() {
  return (
    <button
      onClick={() => {
        window.location.href = "/dump-data/headers";
      }}
      style={{
        display: "block",
        width: "100%",
        background: "#1976D2",
        color: "#fff",
        border: "none",
        padding: "12px 20px",
        borderRadius: 8,
        fontSize: 15,
        cursor: "pointer",
        marginTop: 16,
      }}
    >
      Navigate to /dump-data/headers
    </button>
  );
}
