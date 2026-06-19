"use client";

export function PrintButton() {
  return (
    <div className="no-print" style={{ textAlign: "center", padding: "16px", background: "#f5f5f5" }}>
      <button
        onClick={() => window.print()}
        style={{
          background: "#15803d", color: "white", border: "none", padding: "10px 28px",
          borderRadius: "8px", fontWeight: "700", fontSize: "14px", cursor: "pointer",
        }}
      >
        Cetak Invoice
      </button>
    </div>
  );
}
