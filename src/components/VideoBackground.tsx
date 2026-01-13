import React from "react";
import "./VideoBackground.css";

export const VideoBackground: React.FC = () => (
    <div className="video-bg-wrapper">
        <video className="video-bg" autoPlay loop muted playsInline>
            <source src="/background.webm" type="video/webm" />
            <source src="/background.mp4" type="video/mp4" />
            {/* fallback image */}
            <img src="/fallback.jpg" alt="Background" className="video-bg-fallback" />
        </video>
        <div className="video-bg-overlay" />
    </div>
);
