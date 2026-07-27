import React from 'react';
import './HomeHeroScene.css';

const HomeHeroScene = ({ children }) => {
  return (
    <div className="home-hero">
      {/* Wall shelf with books — top right */}
      <div className="home-hero-shelf" aria-hidden="true">
        <span className="home-hero-shelf-board" />
        <span className="home-hero-shelf-book home-hero-shelf-book-1" />
        <span className="home-hero-shelf-book home-hero-shelf-book-2" />
        <span className="home-hero-shelf-book home-hero-shelf-book-3" />
        <span className="home-hero-shelf-book home-hero-shelf-book-4" />
        <span className="home-hero-shelf-book home-hero-shelf-book-5" />
      </div>

      {/* Wall clock — top right */}
      <div className="home-hero-clock" aria-hidden="true">
        <span className="home-hero-clock-face" />
        <span className="home-hero-clock-hand home-hero-clock-hour" />
        <span className="home-hero-clock-hand home-hero-clock-minute" />
        <span className="home-hero-clock-center" />
      </div>

      {/* Window — top left */}
      <div className="home-hero-window" aria-hidden="true">
        <span className="home-hero-window-pane" />
        <span className="home-hero-window-pane" />
        <span className="home-hero-window-pane" />
        <span className="home-hero-window-pane" />
        <span className="home-hero-sun" />
        <span className="home-hero-ray home-hero-ray-a" />
        <span className="home-hero-ray home-hero-ray-b" />
        <span className="home-hero-ray home-hero-ray-c" />
      </div>

      {/* Small chalkboard — left side */}
      <div className="home-hero-board" aria-hidden="true">
        <span className="home-hero-board-chalk home-hero-board-chalk-1" />
        <span className="home-hero-board-chalk home-hero-board-chalk-2" />
        <span className="home-hero-board-chalk home-hero-board-chalk-3" />
        <span className="home-hero-board-star" />
        <span className="home-hero-board-tray" />
        <span className="home-hero-board-eraser" />
        <span className="home-hero-board-leg home-hero-board-leg-l" />
        <span className="home-hero-board-leg home-hero-board-leg-r" />
      </div>

      {/* Plant — left, near window */}
      <div className="home-hero-plant" aria-hidden="true">
        <span className="home-hero-plant-pot" />
        <span className="home-hero-plant-leaf home-hero-plant-leaf-a" />
        <span className="home-hero-plant-leaf home-hero-plant-leaf-b" />
        <span className="home-hero-plant-leaf home-hero-plant-leaf-c" />
      </div>

      {/* Globe — right side */}
      <div className="home-hero-globe" aria-hidden="true">
        <span className="home-hero-globe-ball" />
        <span className="home-hero-globe-stand" />
      </div>

      {/* Floaters stay on the sides only (center reserved for ClassPy) */}
      <div className="home-hero-floaters" aria-hidden="true">
        <span className="home-hero-book home-hero-book-a" />
        <span className="home-hero-book home-hero-book-b" />
        <span className="home-hero-book home-hero-book-e" />
        <span className="home-hero-book home-hero-book-f" />
        <span className="home-hero-book home-hero-book-g" />
        <span className="home-hero-paper home-hero-paper-a" />
        <span className="home-hero-paper home-hero-paper-b" />
        <span className="home-hero-pencil" />
        <span className="home-hero-ruler" />
        <span className="home-hero-eraser" />
      </div>

      {/* Teacher desk — right */}
      <div className="home-hero-desk" aria-hidden="true">
        <span className="home-hero-desk-lamp" />
        <span className="home-hero-desk-stack home-hero-desk-stack-a" />
        <span className="home-hero-desk-stack home-hero-desk-stack-b" />
        <span className="home-hero-desk-stack home-hero-desk-stack-c" />
        <span className="home-hero-desk-apple" />
        <span className="home-hero-desk-cup" />
        <span className="home-hero-desk-top" />
        <span className="home-hero-desk-leg home-hero-desk-leg-l" />
        <span className="home-hero-desk-leg home-hero-desk-leg-r" />
      </div>

      {/* Open textbook — left floor */}
      <div className="home-hero-open-text" aria-hidden="true">
        <span className="home-hero-open-text-left" />
        <span className="home-hero-open-text-right" />
        <span className="home-hero-open-text-spine" />
      </div>

      {/* Backpack — right floor */}
      <div className="home-hero-backpack" aria-hidden="true">
        <span className="home-hero-backpack-body" />
        <span className="home-hero-backpack-pocket" />
        <span className="home-hero-backpack-strap" />
      </div>

      <div className="home-hero-ground" aria-hidden="true">
        <span className="home-hero-path" />
      </div>

      {children}
    </div>
  );
};

export default HomeHeroScene;
