import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

// Define bone data with name and approximate coordinates (for 1920x1920 image)
interface Bone {
  name: string;
  x: number; // x-coordinate for label placement
  y: number; // y-coordinate for label placement
  arrowX: number; // x-coordinate for arrow tip (pointing to bone)
  arrowY: number; // y-coordinate for arrow tip
}

const allBones: Bone[] = [
  { name: "Skull", x: 960, y: 200, arrowX: 960, arrowY: 250 },
  { name: "Clavicle", x: 860, y: 350, arrowX: 910, arrowY: 350 },
  { name: "Sternum", x: 960, y: 450, arrowX: 960, arrowY: 450 },
  { name: "Humerus (Left)", x: 760, y: 450, arrowX: 810, arrowY: 450 },
  { name: "Humerus (Right)", x: 1160, y: 450, arrowX: 1110, arrowY: 450 },
  { name: "Radius (Left)", x: 740, y: 550, arrowX: 790, arrowY: 550 },
  { name: "Ulna (Left)", x: 720, y: 550, arrowX: 770, arrowY: 550 },
  { name: "Femur (Left)", x: 880, y: 800, arrowX: 920, arrowY: 800 },
  { name: "Tibia (Left)", x: 880, y: 1000, arrowX: 920, arrowY: 1000 },
  { name: "Fibula (Left)", x: 860, y: 1000, arrowX: 900, arrowY: 1000 },
  // Add more bones as needed
];

const HumanBoneQuiz: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [guessedBones, setGuessedBones] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [imageLoaded, setImageLoaded] = useState(false);
  const skeletonImage = useRef<HTMLImageElement | null>(null);

  // Load the skeleton image (replace with actual image URL)
  useEffect(() => {
    skeletonImage.current = new Image();
    skeletonImage.current.src = "/skeleton.png"; // Update with your image path
    skeletonImage.current.onload = () => {
      setImageLoaded(true);
    };
  }, []);

  // Draw canvas content whenever guessedBones or image changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageLoaded || !skeletonImage.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container (responsive)
    const container = canvas.parentElement;
    if (container) {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scale to fit image in canvas (assuming image is 1920x1920)
    const scale = Math.min(canvas.width, canvas.height) / 1920;
    const offsetX = (canvas.width - 1920 * scale) / 2;
    const offsetY = (canvas.height - 1920 * scale) / 2;

    // Draw skeleton image
    ctx.drawImage(
      skeletonImage.current,
      offsetX,
      offsetY,
      1920 * scale,
      1920 * scale
    );

    // Draw labels and arrows for guessed bones
    guessedBones.forEach((boneName) => {
      const bone = allBones.find(
        (b) => b.name.toLowerCase() === boneName.toLowerCase()
      );
      if (bone) {
        // Scale coordinates
        const x = bone.x * scale + offsetX;
        const y = bone.y * scale + offsetY;
        const arrowX = bone.arrowX * scale + offsetX;
        const arrowY = bone.arrowY * scale + offsetY;

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(arrowX, arrowY);
        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;
        ctx.stroke();
        // Arrowhead (simple triangle)
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(arrowX - 5, arrowY - 5);
        ctx.lineTo(arrowX + 5, arrowY - 5);
        ctx.closePath();
        ctx.fillStyle = "#FF0000";
        ctx.fill();

        // Draw text label
        ctx.font = `${Math.max(16 * scale, 12)}px Arial`;
        ctx.fillStyle = "#000000";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(bone.name, x, y);
      }
    });
  }, [guessedBones, imageLoaded]);

  // Handle input change (real-time checking without Enter)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    const matchedBone = allBones.find(
      (bone) => bone.name.toLowerCase() === value.toLowerCase()
    );
    if (matchedBone && !guessedBones.includes(matchedBone.name)) {
      setGuessedBones((prev) => [...prev, matchedBone.name]);
      setInputValue(""); // Clear input after correct guess
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f0f0f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "16px",
      }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        Human Bone Quiz
      </motion.h1>
      <p style={{ marginBottom: "16px", fontSize: "1.2rem", textAlign: "center" }}>
        Guess the bones! {guessedBones.length} / {allBones.length} found
      </p>
      <div
        style={{
          width: "100%",
          maxWidth: "800px",
          height: "60vh",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          marginBottom: "24px",
        }}
      >
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          display: "flex",
          gap: "16px",
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Type a bone name..."
          style={{
            flex: 1,
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "1rem",
          }}
          autoFocus
        />
        <button
          onClick={() => setGuessedBones([])}
          style={{
            padding: "8px 16px",
            backgroundColor: "#e0e0e0",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default HumanBoneQuiz;